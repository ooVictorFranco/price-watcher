// src/lib/utils.ts
import { Favorite, Snapshot } from '@/types';

export function brl(n?: number | null) {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function getHistoryKey(idOrUrl: string) {
  return `kabum_history:${idOrUrl}`;
}

export function parseIdOrUrl(input: string) {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return { idOrUrl: trimmed, mode: 'id' as const };
  const m = trimmed.match(/\/produto\/(\d+)/);
  if (m) return { idOrUrl: m[1], mode: 'id' as const };
  return { idOrUrl: trimmed, mode: 'url' as const };
}

export function kabumUrlForId(id: string) {
  return `https://www.kabum.com.br/produto/${id}`;
}

export function discountPctFrom(snapshot?: Snapshot | null) {
  if (!snapshot?.priceOriginal || !snapshot?.priceVista) return null;
  if (snapshot.priceOriginal <= 0) return null;
  const pct = Math.round((1 - snapshot.priceVista / snapshot.priceOriginal) * 100);
  return Number.isFinite(pct) ? pct : null;
}

/** Compara apenas os valores de preço (ignora timestamp). */
export function isSamePrices(a: Snapshot | undefined, b: Snapshot | undefined) {
  if (!a || !b) return false;
  return (
    (a.priceVista ?? null) === (b.priceVista ?? null) &&
    (a.priceParcelado ?? null) === (b.priceParcelado ?? null) &&
    (a.priceOriginal ?? null) === (b.priceOriginal ?? null)
  );
}

/**
 * Insere snapshot no histórico com deduplicação:
 * - Se os preços forem iguais ao último, substitui o último (atualiza o timestamp).
 * - Se algum preço mudou, adiciona uma nova entrada.
 */
export function upsertHistory(prev: Snapshot[], snap: Snapshot, limit = 500): Snapshot[] {
  const last = prev.at(-1);
  if (isSamePrices(last, snap)) {
    const next = prev.slice();
    next[next.length - 1] = { ...snap }; // mantém preços iguais, atualiza timestamp
    return next.slice(-limit);
  }
  return [...prev, snap].slice(-limit);
}

// ---------- Favoritos (localStorage)
const FAV_KEY = 'kabum_favorites';

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

export function saveFavorites(list: Favorite[]) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list));
}

export function isFavorite(id: string) {
  return loadFavorites().some(f => f.id === id);
}

export function addFavorite(fav: Favorite) {
  const list = loadFavorites();
  if (!list.some(f => f.id === fav.id)) {
    list.unshift(fav);
    saveFavorites(list.slice(0, 200));
  }
}

export function removeFavorite(id: string) {
  const list = loadFavorites().filter(f => f.id !== id);
  saveFavorites(list);
}
