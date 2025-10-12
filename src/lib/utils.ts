// src/lib/utils.ts
import { Favorite, Snapshot } from '@/types';

export function brl(n?: number | null) {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Formata timestamp como tempo relativo (ex: "há 5 minutos")
 */
export function timeAgo(timestamp?: number | null): string {
  if (!timestamp) return 'nunca';

  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'agora mesmo';
  if (minutes < 60) return `há ${minutes} min`;
  if (hours < 24) return `há ${hours}h`;
  if (days < 7) return `há ${days}d`;
  return `há ${Math.floor(days / 7)} sem`;
}

/** Limites globais */
export const FAV_LIMIT = 25;
export const HISTORY_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 90; // 90 dias

export const HISTORY_PREFIX = 'kabum_history:';
export function getHistoryKey(idOrUrl: string) {
  return `${HISTORY_PREFIX}${idOrUrl}`;
}

export function kabumUrlForId(id: string) {
  return `https://www.kabum.com.br/produto/${id}`;
}
export function amazonUrlForAsin(asin: string) {
  return `https://www.amazon.com.br/dp/${asin.toUpperCase()}`;
}
export function kabumSearchUrl(query: string) {
  return `https://www.kabum.com.br/busca/${encodeURIComponent(query)}`;
}

/** Detecta KaBuM (id/URL) ou Amazon (ASIN/URL, inclusive a.co e amzn.to) */
export function parseIdOrUrl(input: string):
  | { mode: 'id'; idOrUrl: string; provider: 'kabum' }
  | { mode: 'url'; idOrUrl: string; provider: 'kabum' }
  | { mode: 'asin'; idOrUrl: string; provider: 'amazon' }
  | { mode: 'url'; idOrUrl: string; provider: 'amazon' } {
  const trimmed = input.trim();

  // KaBuM numérico
  if (/^\d+$/.test(trimmed)) return { mode: 'id', idOrUrl: trimmed, provider: 'kabum' as const };

  // KaBuM url
  if (/kabum\.com\.br/i.test(trimmed)) {
    const km = trimmed.match(/kabum\.com\.br\/produto\/(\d+)/i);
    if (km) return { mode: 'id', idOrUrl: km[1], provider: 'kabum' as const };
    return { mode: 'url', idOrUrl: trimmed, provider: 'kabum' as const };
  }

  // Amazon ASIN
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) {
    return { mode: 'asin', idOrUrl: trimmed.toUpperCase(), provider: 'amazon' as const };
  }

  // Amazon urls (inclui encurtadores a.co e amzn.to)
  if (/^https?:\/\/(?:[^/]*\.)?(?:amazon\.[^/]+|a\.co|amzn\.to)\//i.test(trimmed)) {
    const am = trimmed.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    if (am) return { mode: 'asin', idOrUrl: am[1].toUpperCase(), provider: 'amazon' as const };
    return { mode: 'url', idOrUrl: trimmed, provider: 'amazon' as const };
  }

  // fallback
  return { mode: 'url', idOrUrl: trimmed, provider: 'kabum' as const };
}

export function externalUrlFromId(id: string) {
  if (/^\d+$/.test(id)) return kabumUrlForId(id);
  if (/^[A-Z0-9]{10}$/i.test(id)) return amazonUrlForAsin(id);
  if (/^https?:\/\//i.test(id)) return id;
  return kabumUrlForId(id);
}

export function discountPctFrom(snapshot?: Snapshot | null) {
  if (!snapshot?.priceOriginal || !snapshot?.priceVista) return null;
  if (snapshot.priceOriginal <= 0) return null;
  const pct = Math.round((1 - snapshot.priceVista / snapshot.priceOriginal) * 100);
  return Number.isFinite(pct) ? pct : null;
}

export function isSamePrices(a: Snapshot | undefined, b: Snapshot | undefined) {
  if (!a || !b) return false;
  return (
    (a.priceVista ?? null) === (b.priceVista ?? null) &&
    (a.priceParcelado ?? null) === (b.priceParcelado ?? null) &&
    (a.priceOriginal ?? null) === (b.priceOriginal ?? null)
  );
}

export function upsertHistory(prev: Snapshot[], snap: Snapshot, limit = 500): Snapshot[] {
  const last = prev.at(-1);
  if (isSamePrices(last, snap)) {
    const next = prev.slice();
    next[next.length - 1] = { ...snap };
    return next.slice(-limit);
  }
  return [...prev, snap].slice(-limit);
}

export function pruneHistoryByAge(arr: Snapshot[], now = Date.now(), maxAgeMs = HISTORY_MAX_AGE_MS): Snapshot[] {
  return arr.filter(s => typeof s?.timestamp === 'number' && (now - s.timestamp) <= maxAgeMs);
}

export function emitDataChanged(ids?: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('kabum:data-changed', {
      detail: { ids: ids ?? null, at: Date.now() },
    }));
  } catch {}
}

// ---------- Favoritos (localStorage)
export const FAV_KEY = 'kabum_favorites';

export function loadFavorites(): Favorite[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Favorite[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function clampFavorites(list: Favorite[]): Favorite[] {
  const sorted = [...list].sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));
  return sorted.slice(0, FAV_LIMIT);
}

export function saveFavorites(list: Favorite[]) {
  const clamped = clampFavorites(list);
  localStorage.setItem(FAV_KEY, JSON.stringify(clamped));
  emitDataChanged();
}

export function isFavorite(id: string) {
  return loadFavorites().some(f => f.id === id);
}

export function addFavorite(fav: Favorite) {
  const list = loadFavorites();
  const existingIdx = list.findIndex(f => f.id === fav.id);
  if (existingIdx >= 0) list.splice(existingIdx, 1);
  list.unshift({ ...fav, addedAt: fav.addedAt ?? Date.now() });
  saveFavorites(list);
}

export function removeFavorite(id: string) {
  const list = loadFavorites().filter(f => f.id !== id);
  saveFavorites(list);
}

export function saveHistory(idOrUrl: string, data: Snapshot[]) {
  const pruned = pruneHistoryByAge(data);
  localStorage.setItem(getHistoryKey(idOrUrl), JSON.stringify(pruned));
  emitDataChanged([idOrUrl]);
}
