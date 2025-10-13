// src/hooks/useFavorites.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '@/lib/session';
import { Favorite } from '@/types';

interface Product {
  id: string;
  productId: string;
  provider: string;
  name: string;
  image: string | null;
  groupId: string | null;
  addedAt: string;
  lastCheckedAt: string | null;
  priceHistory: Array<{
    id: string;
    timestamp: string;
    priceVista: number | null;
    priceParcelado: number | null;
    priceOriginal: number | null;
  }>;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca favoritos do banco de dados
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/favorites', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      const { products } = data as { products: Product[] };

      // Converte formato do banco para formato do frontend
      const favs: Favorite[] = products.map((p) => ({
        id: p.productId,
        name: p.name,
        image: p.image,
        addedAt: new Date(p.addedAt).getTime(),
        lastCheckedAt: p.lastCheckedAt ? new Date(p.lastCheckedAt).getTime() : null,
        groupId: p.groupId,
      }));

      setFavorites(favs);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Adiciona favorito
  const addFavorite = useCallback(async (favorite: Omit<Favorite, 'addedAt'>) => {
    try {
      // Detecta provider baseado no ID
      let provider = 'kabum';
      if (/^[A-Z0-9]{10}$/i.test(favorite.id) || /^https?:\/\//i.test(favorite.id)) {
        provider = 'amazon';
      }

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productId: favorite.id,
          provider,
          name: favorite.name,
          image: favorite.image,
          groupId: favorite.groupId,
        }),
      });

      if (!response.ok && response.status !== 409) {
        throw new Error('Failed to add favorite');
      }

      // Recarrega a lista
      await fetchFavorites();
    } catch (err) {
      console.error('Error adding favorite:', err);
      throw err;
    }
  }, [fetchFavorites]);

  // Remove favorito
  const removeFavorite = useCallback(async (id: string) => {
    try {
      // Detecta provider
      let provider = 'kabum';
      if (/^[A-Z0-9]{10}$/i.test(id) || /^https?:\/\//i.test(id)) {
        provider = 'amazon';
      }

      const response = await fetch(`/api/favorites?productId=${id}&provider=${provider}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      // Recarrega a lista
      await fetchFavorites();
    } catch (err) {
      console.error('Error removing favorite:', err);
      throw err;
    }
  }, [fetchFavorites]);

  // Carrega favoritos ao montar
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    refetch: fetchFavorites,
  };
}
