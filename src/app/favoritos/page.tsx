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
  saveHistory,
} from '@/lib/utils';
import FavoritesList from '@/components/FavoritesList';
import ComparePanel from '@/components/ComparePanel';
import CompareChart, { makeCompareSeries } from '@/components/CompareChart';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';

export default function FavoritosPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [compareSelected, setCompareSelected] = useState<string[]>([]);
  const [compareMetric, setCompareMetric] = useState<'vista' | 'parcelado' | 'original'>('vista');

  const [loadingSelected, setLoadingSelected] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [shimmeringIds, setShimmeringIds] = useState<string[]>([]);

  const [latestById, setLatestById] = useState<Record<string, Snapshot | undefined>>({});
  const [prevById, setPrevById] = useState<Record<string, Snapshot | undefined>>({});

  useEffect(() => {
    document.title = 'Favoritos — Monitor de preço';
  }, []);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  useEffect(() => {
    syncSnapshots(favorites.map(f => f.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites]);

  useEffect(() => {
    const onAuto = (e: Event) => {
      const detail = (e as CustomEvent).detail as { ids?: string[] } | undefined;
      const ids = detail?.ids ?? favorites.map(f => f.id);
      syncSnapshots(ids);
    };
    window.addEventListener('kabum:auto-refresh', onAuto as EventListener);
    return () => window.removeEventListener('kabum:auto-refresh', onAuto as EventListener);
  }, [favorites]);

  const deleteFavorite = (id: string) => {
    removeFavorite(id);
    const nextFavs = favorites.filter(f => f.id !== id);
    setFavorites(nextFavs);
    saveFavorites(nextFavs);
    setCompareSelected(prev => prev.filter(x => x !== id));
    setLatestById(prev => { const { [id]: _, ...rest } = prev; return rest; });
    setPrevById(prev => { const { [id]: _, ...rest } = prev; return rest; });
    toast.success('Removido dos favoritos.');
  };

  const toggleCompare = (id: string) => {
    setCompareSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const removeFromCompare = (id: string) => setCompareSelected(prev => prev.filter(x => x !== id));
  const clearCompare = () => setCompareSelected([]);

  const refreshSelected = async () => {
    if (!compareSelected.length) return;
    setLoadingSelected(true);
    setShimmeringIds(compareSelected);
    try {
      for (const id of compareSelected) {
        await fetchAndUpsert(id);
      }
      syncSnapshots(compareSelected);
      toast.info(`Atualizados ${compareSelected.length} selecionados.`);
    } catch (e) {
      console.error(e);
      toast.error('Não consegui atualizar agora.');
    } finally {
      setLoadingSelected(false);
      setShimmeringIds([]);
    }
  };

  const refreshAllFavorites = async () => {
    if (!favorites.length) return;
    setLoadingAll(true);
    setShimmeringIds(favorites.map(f => f.id));
    try {
      for (const f of favorites) {
        await fetchAndUpsert(f.id);
      }
      syncSnapshots(favorites.map(f => f.id));
      toast.info('Todos os favoritos foram atualizados.');
    } catch (e) {
      console.error(e);
      toast.error('Não consegui atualizar todos agora.');
    } finally {
      setLoadingAll(false);
      setShimmeringIds([]);
    }
  };

  async function fetchAndUpsert(id: string) {
    const url = new URL(window.location.origin + '/api/scrape');
    url.searchParams.set('id', id);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('fetch failed');
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
    saveHistory(id, next);
  }

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
            O app verifica seus favoritos automaticamente a cada <strong>3 horas</strong>.
            Use o <strong>Backup</strong> para exportar/importar ou vincular um arquivo “vivo”.
          </p>
        </header>

        <section className="space-y-4">
          <FavoritesList
            favorites={favorites}
            onMonitor={(id) => router.push(`/?id=${id}`)}
            onRemove={deleteFavorite}
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
            onRemove={(id) => removeFromCompare(id)}
            onClear={() => clearCompare()}
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
