// src/lib/backup.ts
'use client';

import { Favorite, Snapshot } from '@/types';
import { HISTORY_PREFIX, loadFavorites, saveFavorites, getHistoryKey, upsertHistory, emitDataChanged } from './utils';

export type BackupBlob = {
  version: 1;
  exportedAt: number; // epoch ms
  favorites: Favorite[];
  histories: Record<string, Snapshot[]>; // id -> snapshots
};

export function exportLocalData(): BackupBlob {
  const favorites = loadFavorites();

  const histories: Record<string, Snapshot[]> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i) || '';
    if (k.startsWith(HISTORY_PREFIX)) {
      try {
        const id = k.slice(HISTORY_PREFIX.length);
        histories[id] = JSON.parse(localStorage.getItem(k) || '[]') as Snapshot[];
      } catch {
        // ignora chave inválida
      }
    }
  }
  return { version: 1, exportedAt: Date.now(), favorites, histories };
}

export function importDataMerge(blob: BackupBlob): { favorites: number; histories: number; ids: string[] } {
  if (!blob || blob.version !== 1) throw new Error('Backup inválido');

  // Merge de favoritos (união por id, mantendo nome/imagem mais recentes)
  const existing = loadFavorites();
  const map = new Map<string, Favorite>();
  for (const f of existing) map.set(f.id, f);
  for (const f of (blob.favorites ?? [])) map.set(f.id, f);
  const mergedFavs = Array.from(map.values());
  saveFavorites(mergedFavs);

  // Merge de históricos por produto
  const ids: string[] = [];
  let histCount = 0;
  for (const [id, arr] of Object.entries(blob.histories ?? {})) {
    try {
      const key = getHistoryKey(id);
      const prevRaw = localStorage.getItem(key);
      const prev = prevRaw ? (JSON.parse(prevRaw) as Snapshot[]) : [];
      // aplica upsert sequencial garantido por ordem (sort por timestamp)
      const sorted = [...arr].sort((a, b) => a.timestamp - b.timestamp);
      let merged = prev.slice();
      for (const s of sorted) merged = upsertHistory(merged, s);
      localStorage.setItem(key, JSON.stringify(merged));
      histCount += merged.length;
      ids.push(id);
    } catch {
      // segue para o próximo
    }
  }

  emitDataChanged(ids);
  return { favorites: mergedFavs.length, histories: histCount, ids };
}
