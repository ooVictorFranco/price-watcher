// src/lib/backup.ts
'use client';

import { Favorite, Snapshot, ProductGroup } from '@/types';
import {
  HISTORY_PREFIX,
  loadFavorites,
  saveFavorites,
  getHistoryKey,
  upsertHistory,
  emitDataChanged,
  pruneHistoryByAge,
  FAV_LIMIT,
  loadProductGroups,
  saveProductGroups,
} from './utils';

/** Favorito otimizado para backup (remove dados voláteis) */
export type BackupFavorite = {
  id: string;
  name?: string;       // opcional - cache que pode ser rehidratado
  image?: string | null; // opcional - cache que pode ser rehidratado
  addedAt: number;
  groupId?: string | null;
  // lastCheckedAt removido - informação volátil
};

export type BackupBlob = {
  version: 2;  // incrementado para nova estrutura
  exportedAt: number; // epoch ms
  favorites: BackupFavorite[];  // otimizado
  groups: ProductGroup[];       // grupos de produtos unificados
  histories: Record<string, Snapshot[]>; // id -> snapshots
};

/**
 * Exporta dados otimizados:
 * - Favoritos sem lastCheckedAt (volátil)
 * - Mantém name/image como cache opcional
 * - Inclui grupos de produtos
 * - Históricos apenas dentro da janela de 3 meses
 */
export function exportLocalData(): BackupBlob {
  const favorites = loadFavorites();
  const groups = loadProductGroups();

  // Converte favoritos para formato otimizado
  const backupFavorites: BackupFavorite[] = favorites.map(f => ({
    id: f.id,
    name: f.name,        // mantém como cache
    image: f.image,      // mantém como cache
    addedAt: f.addedAt,
    groupId: f.groupId,
    // lastCheckedAt removido - não é necessário no backup
  }));

  const histories: Record<string, Snapshot[]> = {};
  const now = Date.now();

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i) || '';
    if (k.startsWith(HISTORY_PREFIX)) {
      try {
        const id = k.slice(HISTORY_PREFIX.length);
        const rawArr = JSON.parse(localStorage.getItem(k) || '[]') as Snapshot[];
        histories[id] = pruneHistoryByAge(rawArr, now);
      } catch {
        // ignora chave inválida
      }
    }
  }

  return { version: 2, exportedAt: now, favorites: backupFavorites, groups, histories };
}

/** Tipo para retrocompatibilidade com backup v1 */
type BackupBlobV1 = {
  version: 1;
  exportedAt: number;
  favorites: Favorite[];
  histories: Record<string, Snapshot[]>;
};

/** União de versões de backup suportadas */
type BackupBlobAny = BackupBlob | BackupBlobV1;

/**
 * Importa/mescla um backup com retrocompatibilidade:
 * - Suporta versão 1 (antiga) e versão 2 (nova)
 * - Favoritos: união por id, mantém os 25 mais recentes (addedAt desc)
 * - Grupos: merge por id
 * - Históricos: upsert ordenado por timestamp + retenção de 3 meses
 * - Retorna lista de IDs que necessitam hidratação
 */
export function importDataMerge(blob: BackupBlobAny): {
  favorites: number;
  histories: number;
  groups: number;
  ids: string[];
  needsHydration: string[];  // IDs sem name/image
} {
  if (!blob || (blob.version !== 1 && blob.version !== 2)) {
    throw new Error('Backup inválido ou versão não suportada');
  }

  const needsHydration: string[] = [];

  // ---- Favoritos (união + clamp 25)
  const existing = loadFavorites();
  const map = new Map<string, Favorite>();

  // Adiciona favoritos existentes
  for (const f of existing) map.set(f.id, f);

  // Merge com favoritos do backup
  for (const f of (blob.favorites ?? [])) {
    const existingFav = map.get(f.id);
    const merged: Favorite = {
      id: f.id,
      name: f.name || existingFav?.name || `Produto ${f.id}`,
      image: f.image ?? existingFav?.image ?? null,
      addedAt: f.addedAt ?? existingFav?.addedAt ?? Date.now(),
      groupId: f.groupId ?? existingFav?.groupId ?? null,
      // lastCheckedAt não é importado - será definido na próxima verificação
    };

    // Se não tem nome ou imagem, marca para hidratação
    if (!f.name || !f.image) {
      needsHydration.push(f.id);
    }

    map.set(f.id, merged);
  }

  const mergedFavs = [...map.values()]
    .sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0))
    .slice(0, FAV_LIMIT);
  saveFavorites(mergedFavs);

  // ---- Grupos (merge - apenas v2)
  let groupsCount = 0;
  if (blob.version === 2 && blob.groups) {
    const existingGroups = loadProductGroups();
    const groupMap = new Map<string, ProductGroup>();

    // Adiciona grupos existentes
    for (const g of existingGroups) groupMap.set(g.id, g);

    // Merge com grupos do backup
    for (const g of blob.groups) {
      groupMap.set(g.id, g);
    }

    const mergedGroups = [...groupMap.values()];
    saveProductGroups(mergedGroups);
    groupsCount = mergedGroups.length;
  }

  // ---- Históricos (merge + retenção 3 meses)
  const ids: string[] = [];
  let histCount = 0;
  const now = Date.now();

  for (const [id, arr] of Object.entries(blob.histories ?? {})) {
    try {
      const key = getHistoryKey(id);
      const prevRaw = localStorage.getItem(key);
      const prev = prevRaw ? (JSON.parse(prevRaw) as Snapshot[]) : [];

      // ordena por timestamp crescente e faz upsert sequencial
      const sorted = [...(arr as Snapshot[])].sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
      let merged = prev.slice();
      for (const s of sorted) merged = upsertHistory(merged, s);

      // aplica retenção por idade (3 meses)
      merged = pruneHistoryByAge(merged, now);

      localStorage.setItem(key, JSON.stringify(merged));
      histCount += merged.length;
      ids.push(id);
    } catch {
      // segue para o próximo id
    }
  }

  emitDataChanged(ids);
  return {
    favorites: mergedFavs.length,
    histories: histCount,
    groups: groupsCount,
    ids,
    needsHydration: [...new Set(needsHydration)],  // remove duplicatas
  };
}

/**
 * Hidrata metadados (name, image) de produtos em lote
 * Faz requisições em batch de 3 por vez para evitar sobrecarga
 * @param ids - Lista de IDs para hidratar
 * @param onProgress - Callback opcional para progresso (id, sucesso)
 */
export async function hydrateProductMetadata(
  ids: string[],
  onProgress?: (id: string, success: boolean) => void
): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = [];
  const failed: string[] = [];
  const BATCH_SIZE = 3;

  // Processa em batches
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (id) => {
        try {
          // Detecta provider
          const isKabum = /^\d+$/.test(id);
          const isAsin = /^[A-Z0-9]{10}$/i.test(id);

          let res: Response;
          if (isKabum) {
            const url = new URL(window.location.origin + '/api/scrape');
            url.searchParams.set('id', id);
            res = await fetch(url.toString(), { cache: 'no-store' });
          } else if (isAsin) {
            const url = new URL(window.location.origin + '/api/scrape-amazon');
            url.searchParams.set('asin', id);
            res = await fetch(url.toString(), { cache: 'no-store' });
          } else {
            // Tenta como URL
            const url = new URL(window.location.origin + '/api/scrape');
            url.searchParams.set('url', id);
            res = await fetch(url.toString(), { cache: 'no-store' });
          }

          if (!res.ok) {
            failed.push(id);
            onProgress?.(id, false);
            return;
          }

          const json = await res.json();

          // Atualiza apenas name e image do favorito
          if (json?.name || json?.image) {
            const favorites = loadFavorites();
            const idx = favorites.findIndex(f => f.id === id);

            if (idx !== -1) {
              favorites[idx] = {
                ...favorites[idx],
                name: json.name || favorites[idx].name,
                image: json.image ?? favorites[idx].image,
              };
              saveFavorites(favorites);
            }
          }

          success.push(id);
          onProgress?.(id, true);
        } catch (error) {
          console.error(`Erro ao hidratar ${id}:`, error);
          failed.push(id);
          onProgress?.(id, false);
        }
      })
    );

    // Delay entre batches para evitar rate limiting
    if (i + BATCH_SIZE < ids.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Emite evento de atualização
  if (success.length > 0) {
    emitDataChanged(success);
  }

  return { success, failed };
}
