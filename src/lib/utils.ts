// src/lib/utils.ts
import { Favorite, Snapshot } from '@/types';

export function brl(n?: number | null) {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Limites globais */
export const FAV_LIMIT = 25;
export const HISTORY_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 90; // 90 dias (~3 meses)

export const HISTORY_PREFIX = 'kabum_history:';
export function getHistoryKey(idOrUrl: string) {
  return `${HISTORY_PREFIX}${idOrUrl}`;
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

/** Deduplicação: se preços iguais ao último → substitui timestamp do último, senão adiciona. */
export function upsertHistory(prev: Snapshot[], snap: Snapshot, limit = 500): Snapshot[] {
  const last = prev.at(-1);
  if (isSamePrices(last, snap)) {
    const next = prev.slice();
    next[next.length - 1] = { ...snap };
    return next.slice(-limit);
  }
  return [...prev, snap].slice(-limit);
}

/** Remove pontos com mais de HISTORY_MAX_AGE_MS (padrão 90 dias) */
export function pruneHistoryByAge(arr: Snapshot[], now = Date.now(), maxAgeMs = HISTORY_MAX_AGE_MS): Snapshot[] {
  return arr.filter(s => typeof s?.timestamp === 'number' && (now - s.timestamp) <= maxAgeMs);
}

/** Emite um evento global de mudança de dados para integrações (ex.: arquivo “vivo”). */
export function emitDataChanged(ids?: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('kabum:data-changed', {
      detail: { ids: ids ?? null, at: Date.now() },
    }));
  } catch { }
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

/** Garante no máximo FAV_LIMIT favoritos, priorizando os com maior addedAt */
function clampFavorites(list: Favorite[]): Favorite[] {
  const sorted = [...list].sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));
  return sorted.slice(0, FAV_LIMIT);
}

export function saveFavorites(list: Favorite[]) {
  const clamped = clampFavorites(list);
  localStorage.setItem(FAV_KEY, JSON.stringify(clamped));
  emitDataChanged(); // notifica alterações
}

export function isFavorite(id: string) {
  return loadFavorites().some(f => f.id === id);
}

export function addFavorite(fav: Favorite) {
  const list = loadFavorites();
  const existingIdx = list.findIndex(f => f.id === fav.id);
  if (existingIdx >= 0) {
    // atualiza dados e traz para o topo
    list.splice(existingIdx, 1);
  }
  list.unshift({ ...fav, addedAt: fav.addedAt ?? Date.now() });
  saveFavorites(list); // saveFavorites já clamp
}

export function removeFavorite(id: string) {
  const list = loadFavorites().filter(f => f.id !== id);
  saveFavorites(list);
}

/** Salva um histórico completo de um produto, aplicando retenção de 3 meses + evento. */
export function saveHistory(idOrUrl: string, data: Snapshot[]) {
  const pruned = pruneHistoryByAge(data);
  localStorage.setItem(getHistoryKey(idOrUrl), JSON.stringify(pruned));
  emitDataChanged([idOrUrl]);
}
