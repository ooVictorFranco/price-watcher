// src/lib/utils.ts
import { Favorite, Snapshot, ProductGroup } from '@/types';

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

export const HISTORY_PREFIX = 'pw_history:';
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
export function amazonSearchUrl(query: string) {
  return `https://www.amazon.com.br/s?k=${encodeURIComponent(query)}`;
}

/** Detecta KaBuM (id/URL) ou Amazon (ASIN/URL, inclusive a.co e amzn.to) */
export function parseIdOrUrl(input: string):
  | { mode: 'id'; idOrUrl: string; provider: 'kabum' }
  | { mode: 'url'; idOrUrl: string; provider: 'kabum' }
  | { mode: 'asin'; idOrUrl: string; provider: 'amazon' }
  | { mode: 'url'; idOrUrl: string; provider: 'amazon' } {
  const trimmed = input.trim();

  // KaBuM url (verifica antes do ID numérico)
  if (/kabum\.com\.br/i.test(trimmed)) {
    const km = trimmed.match(/kabum\.com\.br\/produto\/(\d+)/i);
    if (km) return { mode: 'id', idOrUrl: km[1], provider: 'kabum' as const };
    return { mode: 'url', idOrUrl: trimmed, provider: 'kabum' as const };
  }

  // Amazon urls (inclui encurtadores a.co e amzn.to)
  if (/^https?:\/\/(?:[^/]*\.)?(?:amazon\.[^/]+|a\.co|amzn\.to)\//i.test(trimmed)) {
    const am = trimmed.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    if (am) return { mode: 'asin', idOrUrl: am[1].toUpperCase(), provider: 'amazon' as const };
    return { mode: 'url', idOrUrl: trimmed, provider: 'amazon' as const };
  }

  // KaBuM ID numérico puro (apenas dígitos)
  if (/^\d+$/.test(trimmed)) return { mode: 'id', idOrUrl: trimmed, provider: 'kabum' as const };

  // Amazon ASIN (10 caracteres alfanuméricos, DEVE conter pelo menos uma letra)
  if (/^[A-Z0-9]{10}$/i.test(trimmed) && /[A-Z]/i.test(trimmed)) {
    return { mode: 'asin', idOrUrl: trimmed.toUpperCase(), provider: 'amazon' as const };
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
    window.dispatchEvent(new CustomEvent('pw:data-changed', {
      detail: { ids: ids ?? null, at: Date.now() },
    }));
  } catch {}
}

// ---------- Favoritos (localStorage)
export const FAV_KEY = 'pw_favorites';

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

// ---------- Grupos de Produtos (localStorage)
export const GROUPS_KEY = 'pw_product_groups';

/** Gera um UUID simples para identificar grupos */
export function generateGroupId(): string {
  return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/** Carrega todos os grupos salvos */
export function loadProductGroups(): ProductGroup[] {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProductGroup[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Salva todos os grupos */
export function saveProductGroups(groups: ProductGroup[]) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  emitDataChanged();
}

/** Cria um novo grupo unificando produtos selecionados */
export function createProductGroup(productIds: string[], favorites: Favorite[]): ProductGroup {
  if (productIds.length < 2) {
    throw new Error('É necessário selecionar pelo menos 2 produtos para criar um grupo');
  }

  // Pega o nome do primeiro produto como base
  const primaryProduct = favorites.find(f => f.id === productIds[0]);
  const groupName = primaryProduct?.name || 'Produto unificado';

  const newGroup: ProductGroup = {
    id: generateGroupId(),
    name: groupName,
    productIds: [...productIds],
    createdAt: Date.now(),
    image: primaryProduct?.image || null,
    primaryProductId: productIds[0],
  };

  const groups = loadProductGroups();
  groups.push(newGroup);
  saveProductGroups(groups);

  // Atualiza os favoritos para incluir o groupId
  const updatedFavorites = favorites.map(fav => {
    if (productIds.includes(fav.id)) {
      return { ...fav, groupId: newGroup.id };
    }
    return fav;
  });
  saveFavorites(updatedFavorites);

  return newGroup;
}

/** Remove um grupo e limpa os groupIds dos favoritos */
export function deleteProductGroup(groupId: string, favorites: Favorite[]) {
  const groups = loadProductGroups().filter(g => g.id !== groupId);
  saveProductGroups(groups);

  // Remove groupId dos favoritos
  const updatedFavorites = favorites.map(fav => {
    if (fav.groupId === groupId) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { groupId: _removed, ...rest } = fav;
      return rest as Favorite;
    }
    return fav;
  });
  saveFavorites(updatedFavorites);
}

/** Remove um produto específico de um grupo */
export function removeProductFromGroup(groupId: string, productId: string, favorites: Favorite[]) {
  const groups = loadProductGroups();
  const group = groups.find(g => g.id === groupId);

  if (!group) return;

  group.productIds = group.productIds.filter(id => id !== productId);

  // Se o grupo ficar com menos de 2 produtos, remove o grupo
  if (group.productIds.length < 2) {
    deleteProductGroup(groupId, favorites);
    return;
  }

  saveProductGroups(groups);

  // Remove groupId do favorito
  const updatedFavorites = favorites.map(fav => {
    if (fav.id === productId && fav.groupId === groupId) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { groupId: _removed, ...rest } = fav;
      return rest as Favorite;
    }
    return fav;
  });
  saveFavorites(updatedFavorites);
}

/** Adiciona um produto a um grupo existente */
export function addProductToGroup(groupId: string, productId: string, favorites: Favorite[]) {
  const groups = loadProductGroups();
  const group = groups.find(g => g.id === groupId);

  if (!group) return;
  if (group.productIds.includes(productId)) return; // Já está no grupo

  group.productIds.push(productId);
  saveProductGroups(groups);

  // Atualiza o favorito
  const updatedFavorites = favorites.map(fav => {
    if (fav.id === productId) {
      return { ...fav, groupId: group.id };
    }
    return fav;
  });
  saveFavorites(updatedFavorites);
}

/** Retorna o grupo de um produto específico */
export function getProductGroup(productId: string): ProductGroup | null {
  const groups = loadProductGroups();
  return groups.find(g => g.productIds.includes(productId)) || null;
}

/** Atualiza o nome de um grupo */
export function updateGroupName(groupId: string, newName: string) {
  const groups = loadProductGroups();
  const group = groups.find(g => g.id === groupId);

  if (!group) return;

  group.name = newName;
  saveProductGroups(groups);
}

// ---------- Comparação de preços em grupos
export interface ProductPriceInfo {
  productId: string;
  provider: 'kabum' | 'amazon';
  priceVista: number | null;
  priceParcelado: number | null;
  priceOriginal: number | null;
  timestamp: number | null;
}

/** Retorna os preços atuais de todos os produtos em um grupo */
export function getGroupPrices(groupId: string): ProductPriceInfo[] {
  const group = loadProductGroups().find(g => g.id === groupId);
  if (!group) return [];

  return group.productIds.map(productId => {
    const key = getHistoryKey(productId);
    const raw = localStorage.getItem(key);
    const history = raw ? (JSON.parse(raw) as Snapshot[]) : [];
    const latest = history.at(-1);

    // Detecta o provider baseado no formato do ID
    const provider: 'kabum' | 'amazon' = /^\d+$/.test(productId) ? 'kabum' : 'amazon';

    return {
      productId,
      provider,
      priceVista: latest?.priceVista ?? null,
      priceParcelado: latest?.priceParcelado ?? null,
      priceOriginal: latest?.priceOriginal ?? null,
      timestamp: latest?.timestamp ?? null,
    };
  });
}

/** Encontra o produto com melhor preço em um grupo (baseado em priceVista) */
export function getBestPriceInGroup(groupId: string): ProductPriceInfo | null {
  const prices = getGroupPrices(groupId);
  const validPrices = prices.filter(p => p.priceVista !== null && p.priceVista > 0);

  if (validPrices.length === 0) return null;

  return validPrices.reduce((best, current) => {
    if (current.priceVista! < best.priceVista!) return current;
    return best;
  });
}

/** Retorna o nome amigável do provider */
export function getProviderName(provider: 'kabum' | 'amazon'): string {
  return provider === 'kabum' ? 'KaBuM!' : 'Amazon';
}
