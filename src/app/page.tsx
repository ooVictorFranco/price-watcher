// src/app/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiResponse, Favorite, ProductInfo, Snapshot } from '@/types';
import {
  addFavorite,
  discountPctFrom,
  getHistoryKey,
  kabumUrlForId,
  loadFavorites,
  parseIdOrUrl,
  removeFavorite,
  upsertHistory,
} from '@/lib/utils';
import SearchBar from '@/components/SearchBar';
import ProductHeader from '@/components/ProductHeader';
import PriceCards from '@/components/PriceCards';
import HistoryChart from '@/components/HistoryChart';
import HistoryTable from '@/components/HistoryTable';
import EmptyState from '@/components/EmptyState';
import SkeletonCards from '@/components/SkeletonCards';

export default function Page() {
  const params = useSearchParams();

  const [input, setInput] = useState('');
  const [loadingMonitor, setLoadingMonitor] = useState(false);

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const intervalRef = useRef<any>(null);

  const last = history.at(-1);
  const discount = useMemo(() => discountPctFrom(last), [last]);
  const isFav = product?.idOrUrl && favorites.some(f => f.id === product.idOrUrl);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  // deep-link: /?id=123456 inicia monitoramento
  useEffect(() => {
    const id = params.get('id');
    if (id && !product) {
      setInput(id);
      startMonitoring(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // ---------- histórico helpers
  const loadHistoryLS = (key: string) => {
    try {
      const raw = localStorage.getItem(getHistoryKey(key));
      if (!raw) return [];
      return JSON.parse(raw) as Snapshot[];
    } catch {
      return [];
    }
  };
  const saveHistoryLS = (key: string, data: Snapshot[]) => {
    localStorage.setItem(getHistoryKey(key), JSON.stringify(data));
  };

  // ---------- monitorar
  const doFetch = async (idOrUrl: string) => {
    setLoadingMonitor(true);
    try {
      const url = new URL(window.location.origin + '/api/scrape');
      url.searchParams.set(/^\d+$/.test(idOrUrl) ? 'id' : 'url', idOrUrl);

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao buscar o produto');
      const json = (await res.json()) as ApiResponse;

      const now = Date.now();
      setProduct({
        idOrUrl,
        name: json.name ?? null,
        image: json.image ?? null,
        lastCheck: now,
        installmentsCount: json.installmentsCount ?? null,
        installmentsValue: json.installmentsValue ?? null,
      });

      const prev = loadHistoryLS(idOrUrl);
      const current: Snapshot = {
        timestamp: now,
        priceVista: json.priceVista ?? null,
        priceParcelado: json.priceParcelado ?? null,
        priceOriginal: json.priceOriginal ?? null,
      };

      const next = upsertHistory(prev, current);
      saveHistoryLS(idOrUrl, next);
      setHistory(next);
    } catch (e) {
      console.error(e);
      alert('Não consegui ler este produto no momento. Tenta novamente mais tarde.');
    } finally {
      setLoadingMonitor(false);
    }
  };

  const startMonitoring = async (pre?: string) => {
    const raw = pre ?? input;
    const { idOrUrl } = parseIdOrUrl(raw);
    setHistory(loadHistoryLS(idOrUrl));
    await doFetch(idOrUrl);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => { doFetch(idOrUrl); }, 3 * 60 * 60 * 1000);
  };

  // ---------- favoritos (marcar/desmarcar)
  const handleToggleFavorite = () => {
    if (!product) return;
    const id = product.idOrUrl;
    const exists = favorites.some(f => f.id === id);
    if (exists) {
      removeFavorite(id);
      setFavorites(prev => prev.filter(f => f.id !== id));
    } else {
      const name = product.name ?? `Produto ${id}`;
      const image = product.image ?? null;
      const fav: Favorite = { id, name, image, addedAt: Date.now() };
      addFavorite(fav);
      setFavorites(prev => [fav, ...prev.filter(f => f.id !== id)]);
    }
  };

  // ---------- limpar
  const clearCurrent = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProduct(null);
    setHistory([]);
    setInput('');
  };

  return (
    <main className="min-h-screen py-8">
      <div className="mx-auto w-full max-w-6xl px-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">Monitoramento</h1>
          <p className="text-sm text-gray-600">Cole o ID/URL do KaBuM! e acompanhe o produto.</p>
        </header>

        <SearchBar
          value={input}
          loadingMonitor={loadingMonitor}
          onChange={setInput}
          onMonitor={() => startMonitoring()}
          onClear={clearCurrent}
          placeholder="Cole um ID (ex.: 922662) ou a URL completa do produto"
        />

        {!product && !loadingMonitor && <EmptyState />}
        {loadingMonitor && <SkeletonCards />}

        {product && (
          <section className="space-y-5">
            <ProductHeader
              product={product}
              last={last}
              discountPct={discount}
              onRefresh={() => doFetch(product.idOrUrl)}
              onFavorite={handleToggleFavorite}
              onClear={clearCurrent}
              isFav={isFav}
              loading={loadingMonitor}
            />
            <PriceCards product={product} last={last} />
            <HistoryChart history={history} />
            <HistoryTable history={history} />
            <div className="text-xs text-gray-500">
              Abrir no KaBuM!:{" "}
              <a
                className="underline"
                href={product.idOrUrl.match(/^\d+$/) ? kabumUrlForId(product.idOrUrl) : product.idOrUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {product.idOrUrl.match(/^\d+$/) ? kabumUrlForId(product.idOrUrl) : product.idOrUrl}
              </a>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
