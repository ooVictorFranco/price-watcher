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
    async function hydrateMeta(list: Favorite[]) {
      const toFix = list.filter(f => !f.name || !f.image).map(f => f.id);
      if (!toFix.length) return;
      setShimmeringIds(prev => [...new Set([...prev, ...toFix])]);
      try {
        for (const id of toFix) await fetchAndUpsert(id, { silent: true });
        syncSnapshots(toFix);
      } finally {
        setShimmeringIds(prev => prev.filter(id => !toFix.includes(id)));
      }
    }

    async function init() {
      const favs = loadFavorites();
      setFavorites(favs);
      await hydrateMeta(favs);
    }
    void init();
  }, []);

  useEffect(() => {
    syncSnapshots(favorites.map(f => f.id));
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
    setLatestById(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _removed1, ...rest } = prev;
      return rest;
    });
    setPrevById(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _removed2, ...rest } = prev;
      return rest;
    });
    toast.success('Removido dos favoritos.');
  };

  const toggleCompare = (id: string) => {
    setCompareSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const removeFromCompare = (id: string) => setCompareSelected(prev => prev.filter(x => x !== id));
  const clearCompare = () => setCompareSelected([]);

  /** Busca dados (KaBuM/Amazon), atualiza histórico e também name/image do favorito. */
  async function fetchAndUpsert(id: string, { silent = false }: { silent?: boolean } = {}) {
    let res: Response;
    if (/^\d+$/.test(id)) {
      const u = new URL(window.location.origin + '/api/scrape');
      u.searchParams.set('id', id);
      res = await fetch(u.toString(), { cache: 'no-store' });
    } else if (/^[A-Z0-9]{10}$/i.test(id) || /^https?:\/\//i.test(id)) {
      const u = new URL(window.location.origin + '/api/scrape-amazon');
      if (/^[A-Z0-9]{10}$/i.test(id)) u.searchParams.set('asin', id);
      else u.searchParams.set('url', id);
      res = await fetch(u.toString(), { cache: 'no-store' });
    } else {
      const u = new URL(window.location.origin + '/api/scrape');
      u.searchParams.set('url', id);
      res = await fetch(u.toString(), { cache: 'no-store' });
    }

    if (!res.ok) {
      if (!silent) toast.error('Falha ao atualizar um favorito.');
      return;
    }
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

    if (json?.name || json?.image) {
      setFavorites(curr => {
        const ix = curr.findIndex(f => f.id === id);
        if (ix === -1) return curr;
        const current = curr[ix];
        const updated: Favorite = {
          ...current,
          name: json.name ?? current.name,
          image: json.image ?? current.image,
        };
        if (updated.name === current.name && updated.image === current.image) return curr;
        const nextFavs = [...curr];
        nextFavs[ix] = updated;
        saveFavorites(nextFavs);
        return nextFavs;
      });
    }
  }

  /** Atualização individual (menu suspenso do card). */
  const refreshOneFavorite = async (id: string) => {
    setShimmeringIds(prev => [...new Set([...prev, id])]);
    try {
      await fetchAndUpsert(id);
      syncSnapshots([id]);
      toast.info('Favorito atualizado.');
    } catch (e) {
      console.error(e);
      toast.error('Não consegui atualizar este item agora.');
    } finally {
      setShimmeringIds(prev => prev.filter(x => x !== id));
    }
  };

  const refreshSelected = async () => {
    if (!compareSelected.length) return;
    setLoadingSelected(true);
    setShimmeringIds(compareSelected);
    try {
      for (const id of compareSelected) await fetchAndUpsert(id);
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
      for (const f of favorites) await fetchAndUpsert(f.id);
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
            Agora também aceitamos Amazon (ASIN/URL). O app verifica automaticamente a cada <strong>3 horas</strong>.
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
            onRefreshOne={refreshOneFavorite}
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
