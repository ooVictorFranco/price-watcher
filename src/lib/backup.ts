// src/lib/backup.ts
'use client';

import { Favorite, Snapshot } from '@/types';
import {
  HISTORY_PREFIX,
  loadFavorites,
  saveFavorites,
  getHistoryKey,
  upsertHistory,
  emitDataChanged,
  pruneHistoryByAge,
  FAV_LIMIT,
} from './utils';

export type BackupBlob = {
  version: 1;
  exportedAt: number; // epoch ms
  favorites: Favorite[];
  histories: Record<string, Snapshot[]>; // id -> snapshots
};

/** Exporta apenas o que está dentro da janela de 3 meses para manter o arquivo leve. */
export function exportLocalData(): BackupBlob {
  const favorites = loadFavorites();

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

  return { version: 1, exportedAt: now, favorites, histories };
}

/**
 * Importa/mescla um backup:
 * - Favoritos: união por id, mantém os 25 mais recentes (addedAt desc).
 * - Históricos: upsert ordenado por timestamp + retenção de 3 meses.
 */
export function importDataMerge(blob: BackupBlob): { favorites: number; histories: number; ids: string[] } {
  if (!blob || blob.version !== 1) throw new Error('Backup inválido');

  // ---- Favoritos (união + clamp 25)
  const existing = loadFavorites();
  const map = new Map<string, Favorite>();
  for (const f of existing) map.set(f.id, f);
  for (const f of (blob.favorites ?? [])) map.set(f.id, { ...f, addedAt: f.addedAt ?? 0 });
  const mergedFavs = [...map.values()]
    .sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0))
    .slice(0, FAV_LIMIT);
  saveFavorites(mergedFavs);

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
      const sorted = [...arr].sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
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
  return { favorites: mergedFavs.length, histories: histCount, ids };
}
