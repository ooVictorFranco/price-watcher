// src/app/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Favorite, ProductInfo, Snapshot } from '@/types';
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
} from '@/lib/utils';
import SearchBar from '@/components/SearchBar';
import ProductHeader from '@/components/ProductHeader';
import PriceCards from '@/components/PriceCards';
import HistoryChart from '@/components/HistoryChart';
import HistoryTable from '@/components/HistoryTable';
import EmptyState from '@/components/EmptyState';
import SkeletonCards from '@/components/SkeletonCards';
import { toast } from '@/lib/toast';
import { fetchProductWithCache, detectProvider } from '@/lib/product-fetch';
import { getSessionId } from '@/lib/session';

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

  const doFetch = async (raw: string) => {
    console.log('[PAGE] doFetch called with raw:', raw);
    setLoadingMonitor(true);
    try {
      const parsed = parseIdOrUrl(raw);
      const idKey = parsed.idOrUrl;
      const provider = detectProvider(idKey);
      console.log('[PAGE] Parsed:', { idKey, provider });

      // Tenta buscar do cache primeiro, depois faz scraping se necessário
      const result = await fetchProductWithCache(idKey, provider);
      console.log('[PAGE] Fetch result:', result);

      const now = Date.now();

      // Mostra indicador visual de cache hit
      if (result.cached) {
        toast.success('Dados carregados do cache compartilhado!', { duration: 2000 });
      }

      setProduct({
        idOrUrl: idKey,
        name: result.data.name ?? null,
        image: result.data.image ?? null,
        lastCheck: now,
        installmentsCount: result.data.installmentsCount ?? null,
        installmentsValue: result.data.installmentsValue ?? null,
      });

      // Carrega histórico local
      const localHistory = loadHistoryLS(idKey);

      // Cria snapshot atual
      const current: Snapshot = {
        timestamp: now,
        priceVista: result.data.priceVista ?? null,
        priceParcelado: result.data.priceParcelado ?? null,
        priceOriginal: result.data.priceOriginal ?? null,
      };
      console.log('[PAGE] Current snapshot:', current);

      // Atualiza localStorage
      const next = upsertHistory(localHistory, current);
      console.log('[PAGE] History after upsert:', next.length, 'items');
      saveHistory(idKey, next);

      // Salva no banco de dados (com seed do histórico local)
      const sessionId = getSessionId();
      try {
        await fetch('/api/history/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            productId: idKey,
            provider,
            priceVista: current.priceVista,
            priceParcelado: current.priceParcelado,
            priceOriginal: current.priceOriginal,
            installmentsCount: result.data.installmentsCount,
            installmentsValue: result.data.installmentsValue,
            source: 'manual',
            localHistory: localHistory, // Envia histórico local para seed
          }),
        });

        // Busca histórico mesclado via API (banco + local)
        const historyResponse = await fetch(
          `/api/history?sessionId=${sessionId}&productId=${encodeURIComponent(idKey)}&provider=${provider}&period=6months`
        );

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          console.log('[PAGE] History from API:', historyData.history?.length || 0, 'items');
          // Se a API retornou array vazio, usa localStorage
          // Array vazio [] é truthy, então precisamos checar o length
          const apiHistory = historyData.history || [];
          setHistory(apiHistory.length > 0 ? apiHistory : next);
        } else {
          console.log('[PAGE] History API failed, using localStorage:', next.length, 'items');
          // Fallback para localStorage se API falhar
          setHistory(next);
        }
      } catch (dbError) {
        console.error('Erro ao salvar no banco, usando localStorage:', dbError);
        // Fallback para localStorage se o banco falhar
        setHistory(next);
      }
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
    console.log('[PAGE] startMonitoring called with:', { pre, input, raw });
    const parsed = parseIdOrUrl(raw);
    console.log('[PAGE] startMonitoring parsed:', parsed);

    const initialHistory = loadHistoryLS(parsed.idOrUrl);
    console.log('[PAGE] Initial history from LS:', initialHistory.length, 'items');
    setHistory(initialHistory);

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
          <h1 className="text-2xl font-bold">Monitor de Preços</h1>
          <p className="text-sm text-gray-600">
            Acompanhe preços e identifique o melhor momento para comprar.
            Cole o ID ou URL do produto para visualizar o histórico completo.
          </p>
        </header>

        <SearchBar
          value={input}
          loadingMonitor={loadingMonitor}
          onChange={setInput}
          onMonitor={(value) => startMonitoring(value)}
          onClear={clearCurrent}
          placeholder="Cole o ID (ex.: 922662 ou B0F7Z9F9SD) ou URL do produto"
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
