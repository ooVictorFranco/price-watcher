// src/hooks/usePriceHistory.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '@/lib/session';
import { Snapshot } from '@/types';

interface PriceSnapshot {
  id: string;
  timestamp: string;
  priceVista: number | null;
  priceParcelado: number | null;
  priceOriginal: number | null;
}

export function usePriceHistory(productId: string) {
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/favorites', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch price history');
      }

      const data = await response.json();
      const { products } = data as { products: Array<{
        productId: string;
        priceHistory: PriceSnapshot[];
      }> };

      // Encontra o produto específico
      const product = products.find((p) => p.productId === productId);

      if (product && product.priceHistory) {
        // Converte formato do banco para formato do frontend
        const snapshots: Snapshot[] = product.priceHistory.map((snap) => ({
          timestamp: new Date(snap.timestamp).getTime(),
          priceVista: snap.priceVista,
          priceParcelado: snap.priceParcelado,
          priceOriginal: snap.priceOriginal,
        }));

        setHistory(snapshots);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error('Error fetching price history:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Adiciona novo snapshot de preço
  const addSnapshot = useCallback(async (snapshot: Omit<Snapshot, 'timestamp'>) => {
    try {
      // Detecta provider
      let provider = 'kabum';
      if (/^[A-Z0-9]{10}$/i.test(productId) || /^https?:\/\//i.test(productId)) {
        provider = 'amazon';
      }

      const response = await fetch('/api/prices/update', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productId,
          provider,
          priceVista: snapshot.priceVista,
          priceParcelado: snapshot.priceParcelado,
          priceOriginal: snapshot.priceOriginal,
          source: 'manual',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add price snapshot');
      }

      // Recarrega histórico
      await fetchHistory();
    } catch (err) {
      console.error('Error adding price snapshot:', err);
      throw err;
    }
  }, [productId, fetchHistory]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    addSnapshot,
    refetch: fetchHistory,
  };
}
