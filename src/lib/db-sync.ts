// src/lib/db-sync.ts
'use client';

import { getAuthHeaders } from './session';
import { loadFavorites, getHistoryKey } from './utils';
import { Snapshot } from '@/types';

/**
 * Sincroniza um favorito do localStorage para o banco de dados
 */
export async function syncFavoriteToDatabase(favoriteId: string) {
  try {
    const favorites = loadFavorites();
    const favorite = favorites.find((f) => f.id === favoriteId);

    if (!favorite) {
      console.warn(`Favorite ${favoriteId} not found in localStorage`);
      return;
    }

    // Detecta provider
    let provider = 'kabum';
    if (/^[A-Z0-9]{10}$/i.test(favoriteId) || /^https?:\/\//i.test(favoriteId)) {
      provider = 'amazon';
    }

    // Adiciona favorito ao banco
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        productId: favoriteId,
        provider,
        name: favorite.name,
        image: favorite.image,
        url: undefined, // Opcional
        groupId: favorite.groupId,
      }),
    });

    if (!response.ok && response.status !== 409) {
      throw new Error(`Failed to sync favorite: ${response.statusText}`);
    }

    console.log(`✓ Synced favorite ${favoriteId} to database`);
    return true;
  } catch (error) {
    console.error(`Error syncing favorite ${favoriteId}:`, error);
    return false;
  }
}

/**
 * Sincroniza histórico de preços do localStorage para o banco
 */
export async function syncPriceHistoryToDatabase(favoriteId: string) {
  try {
    const historyKey = getHistoryKey(favoriteId);
    const historyRaw = localStorage.getItem(historyKey);

    if (!historyRaw) {
      console.warn(`No history found for ${favoriteId}`);
      return;
    }

    const history: Snapshot[] = JSON.parse(historyRaw);

    if (history.length === 0) {
      return;
    }

    // Detecta provider
    let provider = 'kabum';
    if (/^[A-Z0-9]{10}$/i.test(favoriteId) || /^https?:\/\//i.test(favoriteId)) {
      provider = 'amazon';
    }

    // Envia snapshots em batch (últimos 3 para não sobrecarregar)
    const recentSnapshots = history.slice(-3);

    for (const snap of recentSnapshots) {
      let retries = 2;
      let success = false;

      while (retries > 0 && !success) {
        try {
          const response = await fetch('/api/prices/update', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              productId: favoriteId,
              provider,
              priceVista: snap.priceVista,
              priceParcelado: snap.priceParcelado,
              priceOriginal: snap.priceOriginal,
              source: 'manual',
            }),
          });

          if (response.ok) {
            success = true;
          } else {
            retries--;
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }
        } catch (error) {
          console.error(`Error syncing snapshot for ${favoriteId}:`, error);
          retries--;
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }

      // Delay entre requests
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(`✓ Synced ${recentSnapshots.length} snapshots for ${favoriteId}`);
    return true;
  } catch (error) {
    console.error(`Error syncing history for ${favoriteId}:`, error);
    return false;
  }
}

/**
 * Sincroniza todos os favoritos do localStorage para o banco
 */
export async function syncAllToDatabase() {
  try {
    console.log('[SYNC] Starting full sync to database...');

    const favorites = loadFavorites();

    if (favorites.length === 0) {
      console.log('[SYNC] No favorites to sync');
      return { success: true, synced: 0, total: 0 };
    }

    let synced = 0;

    for (const favorite of favorites) {
      try {
        // Sincroniza favorito
        const favSynced = await syncFavoriteToDatabase(favorite.id);

        // Sincroniza histórico
        const histSynced = await syncPriceHistoryToDatabase(favorite.id);

        if (favSynced || histSynced) {
          synced++;
        }

        // Delay entre produtos para evitar rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error syncing ${favorite.id}:`, error);
        // Continua mesmo com erro
      }
    }

    console.log(`[SYNC] Completed: ${synced}/${favorites.length} products synced`);

    return { success: true, synced, total: favorites.length };
  } catch (error) {
    console.error('[SYNC] Full sync failed:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Hook para sincronização automática em segundo plano
 */
export function startAutoSync() {
  const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos
  const SYNC_KEY = 'pw:last-sync';

  const shouldSync = () => {
    const lastSync = localStorage.getItem(SYNC_KEY);
    if (!lastSync) return true;

    const lastSyncTime = parseInt(lastSync, 10);
    const now = Date.now();

    return now - lastSyncTime >= SYNC_INTERVAL;
  };

  const doSync = async () => {
    if (!shouldSync()) return;

    console.log('[AUTO-SYNC] Starting...');

    try {
      await syncAllToDatabase();
      localStorage.setItem(SYNC_KEY, String(Date.now()));
    } catch (error) {
      console.error('[AUTO-SYNC] Failed:', error);
    }
  };

  // Sincroniza ao iniciar
  doSync();

  // Sincroniza periodicamente
  const interval = setInterval(doSync, SYNC_INTERVAL);

  // Sincroniza quando a aba volta a ficar visível
  const onVisible = () => {
    if (document.visibilityState === 'visible') {
      doSync();
    }
  };
  document.addEventListener('visibilitychange', onVisible);

  // Cleanup
  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisible);
  };
}
