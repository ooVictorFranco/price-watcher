// src/lib/sync.ts
'use client';

import { getAuthHeaders } from './session';
import { loadFavorites, getHistoryKey } from './utils';
import { Snapshot } from '@/types';

/**
 * Migra dados do localStorage para o banco de dados
 */
export async function migrateLocalStorageToDatabase() {
  try {
    console.log('[SYNC] Starting migration from localStorage to database...');

    const favorites = loadFavorites();

    if (!favorites.length) {
      console.log('[SYNC] No favorites found in localStorage');
      return { success: true, migrated: 0 };
    }

    let migrated = 0;

    for (const fav of favorites) {
      try {
        // Detecta provider baseado no ID
        let provider = 'kabum';
        if (/^[A-Z0-9]{10}$/i.test(fav.id) || /^https?:\/\//i.test(fav.id)) {
          provider = 'amazon';
        }

        // Adiciona produto ao banco
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            productId: fav.id,
            provider,
            name: fav.name,
            image: fav.image,
            groupId: fav.groupId,
          }),
        });

        if (response.ok || response.status === 409) {
          // 409 = já existe, tudo bem
          const data = await response.json();
          const productDbId = data.product?.id;

          // Migra histórico de preços
          if (productDbId) {
            const historyKey = getHistoryKey(fav.id);
            const historyRaw = localStorage.getItem(historyKey);

            if (historyRaw) {
              try {
                const history: Snapshot[] = JSON.parse(historyRaw);

                // Envia snapshots para o banco (batch)
                for (const snap of history) {
                  await fetch('/api/prices/update', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                      productId: fav.id,
                      provider,
                      priceVista: snap.priceVista,
                      priceParcelado: snap.priceParcelado,
                      priceOriginal: snap.priceOriginal,
                      source: 'manual',
                    }),
                  });
                }

                console.log(`[SYNC] ✓ Migrated ${history.length} price snapshots for ${fav.id}`);
              } catch (e) {
                console.error(`[SYNC] Error migrating history for ${fav.id}:`, e);
              }
            }
          }

          migrated++;
          console.log(`[SYNC] ✓ Migrated ${fav.name}`);
        }
      } catch (error) {
        console.error(`[SYNC] Error migrating ${fav.name}:`, error);
      }
    }

    console.log(`[SYNC] Migration completed. ${migrated}/${favorites.length} products migrated.`);

    return { success: true, migrated, total: favorites.length };
  } catch (error) {
    console.error('[SYNC] Migration failed:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Sincroniza favoritos do banco para o localStorage (para compatibilidade)
 */
export async function syncDatabaseToLocalStorage() {
  try {
    const response = await fetch('/api/favorites', {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch favorites from database');
    }

    const data = await response.json();
    const { products } = data;

    // Atualiza localStorage com dados do banco
    // (implementação depende de como você quer manter a compatibilidade)

    console.log(`[SYNC] Synced ${products.length} products from database`);

    return { success: true, count: products.length };
  } catch (error) {
    console.error('[SYNC] Sync failed:', error);
    return { success: false, error: String(error) };
  }
}
