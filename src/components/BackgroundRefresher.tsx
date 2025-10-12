// src/components/BackgroundRefresher.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Favorite, Snapshot } from '@/types';
import {
  loadFavorites,
  saveFavorites,
  getHistoryKey,
  upsertHistory,
  saveHistory,
} from '@/lib/utils';

const THREE_HOURS = 3 * 60 * 60 * 1000;
const TICK_MS = 60 * 1000;            // verifica a fila a cada 1 min
const BETWEEN_FETCH_MS = 5000;        // respiro entre itens (5s) para não estourar nada

type QueueItem = { id: string };

// Lê o último timestamp do histórico (ou undefined)
function readLastTimestamp(id: string): number | undefined {
  try {
    const raw = localStorage.getItem(getHistoryKey(id));
    if (!raw) return undefined;
    const arr = JSON.parse(raw) as Snapshot[];
    const last = arr.at(-1);
    return typeof last?.timestamp === 'number' ? last.timestamp : undefined;
  } catch {
    return undefined;
  }
}

// Decide qual endpoint usar (KaBuM numérico / Amazon ASIN/URL / fallback)
async function fetchPricesFor(id: string): Promise<{
  name?: string | null;
  image?: string | null;
  priceVista?: number | null;
  priceParcelado?: number | null;
  priceOriginal?: number | null;
} | null> {
  let res: Response;
  try {
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
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function BackgroundRefresher() {
  const queueRef = useRef<QueueItem[]>([]);
  const inFlightRef = useRef(false);
  const tickRef = useRef<number | null>(null);

  // Enfileira se ainda não está na fila
  const enqueue = (id: string) => {
    const exists = queueRef.current.some((q) => q.id === id);
    if (!exists) queueRef.current.push({ id });
  };

  // Processa UM item por vez
  const processOne = async () => {
    if (inFlightRef.current) return;
    const item = queueRef.current.shift();
    if (!item) return;

    inFlightRef.current = true;
    const id = item.id;

    const json = await fetchPricesFor(id);
    if (json) {
      const now = Date.now();

      // atualiza histórico com dedupe/retention
      const prevRaw = localStorage.getItem(getHistoryKey(id));
      const prev = prevRaw ? (JSON.parse(prevRaw) as Snapshot[]) : [];
      const snap: Snapshot = {
        timestamp: now,
        priceVista: json.priceVista ?? null,
        priceParcelado: json.priceParcelado ?? null,
        priceOriginal: json.priceOriginal ?? null,
      };
      const next = upsertHistory(prev, snap);
      saveHistory(id, next);

      // atualiza metadados do favorito (name/image) se vierem
      if (json.name || json.image) {
        const favs = loadFavorites();
        const idx = favs.findIndex((f) => f.id === id);
        if (idx >= 0) {
          const curr = favs[idx];
          const updated: Favorite = {
            ...curr,
            name: json.name ?? curr.name,
            image: json.image ?? curr.image,
          };
          if (updated.name !== curr.name || updated.image !== curr.image) {
            favs[idx] = updated;
            saveFavorites(favs);
          }
        }
      }

      // notifica telas para atualizarem os cards/graficos
      try {
        window.dispatchEvent(
          new CustomEvent('pw:auto-refresh', { detail: { ids: [id], at: now } })
        );
      } catch { }
    }

    // espaço entre itens para evitar rajada
    setTimeout(() => {
      inFlightRef.current = false;
      // tenta o próximo da fila
      processOne().catch(() => {
        inFlightRef.current = false;
      });
    }, BETWEEN_FETCH_MS);
  };

  // Verifica quem está "vencido" e enfileira
  const scheduleDueFavorites = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      // mesmo em bg os timers rodam, mas não forçamos nada se o navegador estiver muito agressivo
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    const favs = loadFavorites();
    const now = Date.now();

    for (const fav of favs) {
      const lastTs = readLastTimestamp(fav.id) ?? fav.addedAt ?? now;
      const dueAt = lastTs + THREE_HOURS;
      if (now >= dueAt) enqueue(fav.id);
    }

    // dispara o processamento se tiver algo na fila
    if (!inFlightRef.current) void processOne();
  };

  useEffect(() => {
    // primeiro agendamento imediato ao montar
    scheduleDueFavorites();

    // checagem periódica a cada 1 min
    tickRef.current = window.setInterval(scheduleDueFavorites, TICK_MS);

    // re-checar quando a aba volta a ficar visível / voltar on-line
    const onVisible = () => scheduleDueFavorites();
    const onOnline = () => scheduleDueFavorites();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
