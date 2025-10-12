// src/app/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiResponse, Favorite, ProductInfo, Snapshot } from '@/types';
import {
  addFavorite,
  discountPctFrom,
  saveHistory,
  externalUrlFromId,
  loadFavorites,
  parseIdOrUrl,
  removeFavorite,
  upsertHistory,
  getHistoryKey,
  FAV_LIMIT,
} from '@/lib/utils';
import SearchBar from '@/components/SearchBar';
import ProductHeader from '@/components/ProductHeader';
import PriceCards from '@/components/PriceCards';
import HistoryChart from '@/components/HistoryChart';
import HistoryTable from '@/components/HistoryTable';
import EmptyState from '@/components/EmptyState';
import SkeletonCards from '@/components/SkeletonCards';
import { toast } from '@/lib/toast';

export const dynamic = 'force-dynamic';

function PageContent() {
  const params = useSearchParams();

  const [input, setInput] = useState('');
  const [loadingMonitor, setLoadingMonitor] = useState(false);

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const last = history.at(-1);
  const discount = useMemo(() => discountPctFrom(last), [last]);
  const isFav = product?.idOrUrl && favorites.some(f => f.id === product.idOrUrl);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  useEffect(() => {
    const id = params.get('id');
    if (id && !product) {
      setInput(id);
      startMonitoring(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const loadHistoryLS = (key: string) => {
    try {
      const raw = localStorage.getItem(getHistoryKey(key));
      if (!raw) return [];
      return JSON.parse(raw) as Snapshot[];
    } catch {
      return [];
    }
  };

  async function fetchKabum(idOrUrl: string) {
    const url = new URL(window.location.origin + '/api/scrape');
    if (/^\d+$/.test(idOrUrl)) url.searchParams.set('id', idOrUrl);
    else url.searchParams.set('url', idOrUrl);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('kabum_fetch_failed');
    return (await res.json()) as ApiResponse;
  }

  async function fetchAmazon(asinOrUrl: string) {
    const url = new URL(window.location.origin + '/api/scrape-amazon');
    // aceita ASIN puro ou URL
    if (/^[A-Z0-9]{10}$/i.test(asinOrUrl)) url.searchParams.set('asin', asinOrUrl);
    else url.searchParams.set('url', asinOrUrl);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      const errorData = await res.json();
      // Mostra mensagem específica se disponível
      if (errorData.hint) {
        throw new Error(`${errorData.error}: ${errorData.hint}`);
      }
      throw new Error(errorData.error || 'amazon_fetch_failed');
    }
    return (await res.json()) as ApiResponse;
  }

  const doFetch = async (raw: string) => {
    setLoadingMonitor(true);
    try {
      const parsed = parseIdOrUrl(raw);

      const json =
        parsed.provider === 'amazon'
          ? await fetchAmazon(parsed.idOrUrl)
          : await fetchKabum(parsed.idOrUrl);

      const now = Date.now();

      const idKey = parsed.idOrUrl; // usamos o identificador “como digitado”: KaBuM (número) ou Amazon (ASIN)
      setProduct({
        idOrUrl: idKey,
        name: json.name ?? null,
        image: json.image ?? null,
        lastCheck: now,
        installmentsCount: json.installmentsCount ?? null,
        installmentsValue: json.installmentsValue ?? null,
      });

      const prev = loadHistoryLS(idKey);
      const current: Snapshot = {
        timestamp: now,
        priceVista: json.priceVista ?? null,
        priceParcelado: json.priceParcelado ?? null,
        priceOriginal: json.priceOriginal ?? null,
      };
      const next = upsertHistory(prev, current);
      saveHistory(idKey, next);
      setHistory(next);
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'Não consegui ler este produto agora.';
      toast.error(message);
    } finally {
      setLoadingMonitor(false);
    }
  };

  const startMonitoring = async (pre?: string) => {
    const raw = pre ?? input;
    const parsed = parseIdOrUrl(raw);
    setHistory(loadHistoryLS(parsed.idOrUrl));
    await doFetch(raw);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => { doFetch(raw); }, 3 * 60 * 60 * 1000);
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    const id = product.idOrUrl;
    const exists = favorites.some(f => f.id === id);

    if (exists) {
      removeFavorite(id);
      setFavorites(prev => prev.filter(f => f.id !== id));
      toast.success('Removido dos favoritos.');
      return;
    }

    if (favorites.length >= FAV_LIMIT) {
      toast.warning(`Limite de ${FAV_LIMIT} favoritos atingido.`);
      return;
    }

    const name = product.name ?? `Produto ${id}`;
    const image = product.image ?? null;
    const fav: Favorite = { id, name, image, addedAt: Date.now() };
    // id pode ser número (KaBuM) ou ASIN (Amazon)
    addFavorite(fav);
    setFavorites(prev => [fav, ...prev.filter(f => f.id !== id)]);
    toast.success('Adicionado aos favoritos!');
  };

  const clearCurrent = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProduct(null);
    setHistory([]);
    setInput('');
    toast.info('Monitoramento limpo.');
  };

  return (
    <main className="min-h-screen py-8">
      <div className="mx-auto w-full max-w-6xl px-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">Monitoramento</h1>
          <p className="text-sm text-gray-600">
            Cole o ID/URL do KaBuM! (<code>922662</code>) ou o ASIN/URL da Amazon (<code>B0F7Z9F9SD</code>).
          </p>
        </header>

        <SearchBar
          value={input}
          loadingMonitor={loadingMonitor}
          onChange={setInput}
          onMonitor={() => startMonitoring()}
          onClear={clearCurrent}
          placeholder="Cole: ID KaBuM (ex.: 922662), ASIN Amazon (ex.: B0F7Z9F9SD) ou uma URL completa"
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
              isFav={!!isFav}
              loading={loadingMonitor}
            />
            <PriceCards product={product} last={last} />
            <HistoryChart history={history} />
            <HistoryTable history={history} />
            <div className="text-xs text-gray-500">
              Abrir na loja:{' '}
              <a
                className="underline"
                href={externalUrlFromId(product.idOrUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {externalUrlFromId(product.idOrUrl)}
              </a>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<SkeletonCards />}>
      <PageContent />
    </Suspense>
  );
}
