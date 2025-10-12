// src/app/favoritos/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Favorite, Snapshot } from '@/types';
import {
  loadFavorites,
  removeFavorite,
  saveFavorites,
  getHistoryKey,
  upsertHistory,
} from '@/lib/utils';
import FavoritesList from '@/components/FavoritesList';
import ComparePanel from '@/components/ComparePanel';
import CompareChart, { makeCompareSeries } from '@/components/CompareChart';
import { useRouter } from 'next/navigation';

export default function FavoritosPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [compareSelected, setCompareSelected] = useState<string[]>([]);
  const [compareMetric, setCompareMetric] = useState<'vista' | 'parcelado' | 'original'>('vista');

  const [loadingSelected, setLoadingSelected] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  // IDs que estão com shimmer ativo
  const [shimmeringIds, setShimmeringIds] = useState<string[]>([]);

  // snapshots para cards
  const [latestById, setLatestById] = useState<Record<string, Snapshot | undefined>>({});
  const [prevById, setPrevById] = useState<Record<string, Snapshot | undefined>>({});

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  // recarrega últimos e penúltimos snapshots sempre que favoritos mudarem
  useEffect(() => {
    const latest: Record<string, Snapshot | undefined> = {};
    const prev: Record<string, Snapshot | undefined> = {};
    for (const f of favorites) {
      try {
        const raw = localStorage.getItem(getHistoryKey(f.id));
        const arr = raw ? (JSON.parse(raw) as Snapshot[]) : [];
        latest[f.id] = arr.at(-1);
        prev[f.id] = arr.length >= 2 ? arr[arr.length - 2] : undefined;
      } catch {
        latest[f.id] = undefined;
        prev[f.id] = undefined;
      }
    }
    setLatestById(latest);
    setPrevById(prev);
  }, [favorites]);

  // handlers favoritos
  const monitorOnMain = (id: string) => router.push(`/?id=${id}`);
  const deleteFavorite = (id: string) => {
    removeFavorite(id);
    setFavorites(prev => prev.filter(f => f.id !== id));
    setCompareSelected(prev => prev.filter(x => x !== id));
    setLatestById(prev => { const { [id]: _, ...rest } = prev; return rest; });
    setPrevById(prev => { const { [id]: _, ...rest } = prev; return rest; });
  };

  // seleção para comparar (click no card)
  const toggleCompare = (id: string) => {
    setCompareSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const removeFromCompare = (id: string) => setCompareSelected(prev => prev.filter(x => x !== id));
  const clearCompare = () => setCompareSelected([]);

  // atualizar selecionados (ativa shimmer só nos selecionados)
  const refreshSelected = async () => {
    if (!compareSelected.length) return;
    setLoadingSelected(true);
    setShimmeringIds(compareSelected);
    try {
      for (const id of compareSelected) {
        await fetchAndUpsert(id);
      }
      syncSnapshots(compareSelected);
    } catch (e) {
      console.error(e);
      alert('Não consegui atualizar agora.');
    } finally {
      setLoadingSelected(false);
      setShimmeringIds([]);
    }
  };

  // atualizar TODOS (ativa shimmer em todos os cards)
  const refreshAllFavorites = async () => {
    if (!favorites.length) return;
    setLoadingAll(true);
    setShimmeringIds(favorites.map(f => f.id));
    try {
      for (const f of favorites) {
        await fetchAndUpsert(f.id);
      }
      syncSnapshots(favorites.map(f => f.id));
    } catch (e) {
      console.error(e);
      alert('Não consegui atualizar todos agora.');
    } finally {
      setLoadingAll(false);
      setShimmeringIds([]);
    }
  };

  // fetch + upsert (deduplicação)
  async function fetchAndUpsert(id: string) {
    const url = new URL(window.location.origin + '/api/scrape');
    url.searchParams.set('id', id);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return;
    const json = await res.json();
    const now = Date.now();

    const key = getHistoryKey(id);
    const prevRaw = localStorage.getItem(key);
    const prev = prevRaw ? (JSON.parse(prevRaw) as Snapshot[]) : [];

    const snap: Snapshot = {
      timestamp: now,
      priceVista: json.priceVista ?? null,
      priceParcelado: json.priceParcelado ?? null,
      priceOriginal: json.priceOriginal ?? null,
    };

    const next = upsertHistory(prev, snap);
    localStorage.setItem(key, JSON.stringify(next));
  }

  // sincroniza latest e prev após atualização
  function syncSnapshots(ids: string[]) {
    setLatestById(prevMap => {
      const next = { ...prevMap };
      for (const id of ids) {
        try {
          const raw = localStorage.getItem(getHistoryKey(id));
          const arr = raw ? (JSON.parse(raw) as Snapshot[]) : [];
          next[id] = arr.at(-1);
        } catch {
          next[id] = undefined;
        }
      }
      return next;
    });
    setPrevById(prevMap => {
      const next = { ...prevMap };
      for (const id of ids) {
        try {
          const raw = localStorage.getItem(getHistoryKey(id));
          const arr = raw ? (JSON.parse(raw) as Snapshot[]) : [];
          next[id] = arr.length >= 2 ? arr[arr.length - 2] : undefined;
        } catch {
          next[id] = undefined;
        }
      }
      return next;
    });
  }

  // dados para o comparativo
  const nameById: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    favorites.forEach(f => { map[f.id] = f.name; });
    return map;
  }, [favorites]);

  const historyById: Record<string, Snapshot[]> = useMemo(() => {
    const map: Record<string, Snapshot[]> = {};
    compareSelected.forEach(id => {
      try {
        const raw = localStorage.getItem(getHistoryKey(id));
        map[id] = raw ? JSON.parse(raw) as Snapshot[] : [];
      } catch { map[id] = []; }
    });
    return map;
  }, [compareSelected]);

  const compareSeries = makeCompareSeries(compareSelected, nameById, historyById, compareMetric);

  return (
    <main className="min-h-screen py-8">
      <div className="mx-auto w-full max-w-6xl px-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">Favoritos</h1>
          <p className="text-sm text-gray-600">
            Clique no card para <strong>selecionar para comparar</strong>. Use o menu “⋯” para <strong>Ver no KaBuM!</strong> ou <strong>Remover</strong>.
          </p>
        </header>

        <section className="space-y-4">
          <FavoritesList
            favorites={favorites}
            onMonitor={(id) => router.push(`/?id=${id}`)}
            onRemove={(id) => {
              removeFavorite(id);
              setFavorites(favorites.filter(f => f.id !== id));
              saveFavorites(favorites.filter(f => f.id !== id));
            }}
            latestById={latestById}
            prevById={prevById}
            onRefreshAll={refreshAllFavorites}
            loadingAll={loadingAll}
            compareSelected={compareSelected}
            onToggleCompare={toggleCompare}
            shimmeringIds={shimmeringIds}
          />

          <ComparePanel
            selected={compareSelected}
            nameById={nameById}
            metric={compareMetric}
            onMetric={setCompareMetric}
            onRemove={removeFromCompare}
            onClear={clearCompare}
            onCompare={() => {
              if (compareSelected.length < 2) return;
              const el = document.getElementById('compare-anchor');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            onRefreshSelected={refreshSelected}
            disabled={loadingSelected || loadingAll}
            loading={loadingSelected || loadingAll}
          />
        </section>

        <div id="compare-anchor" />
        {compareSelected.length >= 2 && (
          <CompareChart series={compareSeries} />
        )}
      </div>
    </main>
  );
}
