// src/components/FavoritesList.tsx
'use client';

import { Favorite, Snapshot, ProductGroup } from '@/types';
import {
  brl,
  FAV_LIMIT,
  getGroupPrices,
  getBestPriceInGroup,
  getProviderName,
  loadProductGroups,
} from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import GroupCompareChart from './GroupCompareChart';
import ProductCard from './ProductCard';

type Props = {
  favorites: Favorite[];
  onMonitor: (id: string) => void;
  onRemove: (id: string) => void;
  latestById?: Record<string, Snapshot | undefined>;
  prevById?: Record<string, Snapshot | undefined>;
  onRefreshAll?: () => void;
  /** NOVO: atualização individual (`menu → Atualizar agora`) */
  onRefreshOne?: (id: string) => void;
  loadingAll?: boolean;
  compareSelected?: string[];
  onToggleCompare?: (id: string) => void;
  shimmeringIds?: string[];
};

export default function FavoritesList({
  favorites, onMonitor, onRemove, latestById, prevById,
  onRefreshAll, onRefreshOne, loadingAll, compareSelected = [], onToggleCompare, shimmeringIds = [],
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [groupMetric, setGroupMetric] = useState<'vista' | 'parcelado' | 'original'>('vista');
  const prefersReduced = useReducedMotion();
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isSelected = (id: string) => compareSelected.includes(id);
  const isShimmering = (id: string) => shimmeringIds.includes(id);

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Agrupa favoritos
  const groups = loadProductGroups();
  const groupedFavorites: Array<{ type: 'group', group: ProductGroup, favorites: Favorite[] } | { type: 'single', favorite: Favorite }> = [];
  const processedIds = new Set<string>();

  // Primeiro, adiciona os grupos
  groups.forEach(group => {
    const groupFavs = favorites.filter(f => f.groupId === group.id);
    if (groupFavs.length > 0) {
      groupedFavorites.push({ type: 'group', group, favorites: groupFavs });
      groupFavs.forEach(f => processedIds.add(f.id));
    }
  });

  // Depois, adiciona os favoritos sem grupo
  favorites.forEach(fav => {
    if (!processedIds.has(fav.id)) {
      groupedFavorites.push({ type: 'single', favorite: fav });
    }
  });

  // Fechar menu ao clicar fora
  useEffect(() => {
    if (!openMenuId) return;

    const handleClickOutside = (event: MouseEvent) => {
      const menuElement = menuRefs.current[openMenuId];
      if (menuElement && !menuElement.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    // Pequeno delay para evitar fechar imediatamente após abrir
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const total = favorites.length;
  const remaining = Math.max(FAV_LIMIT - total, 0);
  const atLimit = remaining === 0;

  return (
    <motion.div
      layout
      className="rounded-2xl border bg-white shadow-md p-5"
      initial={{ opacity: 0, y: prefersReduced ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h3 className="text-sm font-medium">Favoritos</h3>
            <div className="text-xs text-gray-500">
              <span className={atLimit ? 'text-red-600 font-medium' : ''}>
                {total}/{FAV_LIMIT}
              </span>
              {' '}•{' '}
              <span className={atLimit ? 'text-red-600 font-medium' : ''}>
                {atLimit ? 'limite atingido' : `restam ${remaining}`}
              </span>
            </div>
          </div>

          {atLimit && (
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[11px] rounded-full px-2 py-0.5 border border-red-200 bg-red-50 text-red-700"
            >
              Você atingiu o limite de {FAV_LIMIT} itens
            </motion.span>
          )}
        </div>

        {onRefreshAll && (
          <motion.button
            whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
            whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
            onClick={onRefreshAll}
            disabled={favorites.length === 0 || loadingAll}
            className="rounded-lg px-3 py-2 text-sm border hover:bg-gray-50 disabled:opacity-50 transition"
            title="Atualiza os preços de todos os favoritos"
          >
            {loadingAll ? 'Atualizando…' : 'Atualizar todos'}
          </motion.button>
        )}
      </div>

      {favorites.length === 0 ? (
        <p className="text-sm text-gray-600">
          Nenhum favorito ainda. Use &quot;Favoritar&quot; no produto monitorado. Limite: {FAV_LIMIT} itens.
        </p>
      ) : (
        <motion.ul layout className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {groupedFavorites.map((item, idx) => {
            if (item.type === 'group') {
              const { group, favorites: groupFavs } = item;
              const bestPrice = getBestPriceInGroup(group.id);
              const isExpanded = expandedGroups.has(group.id);
              const groupPrices = getGroupPrices(group.id);

              return (
                <motion.li
                  key={`group-${group.id}`}
                  layout
                  initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full"
                >
                  <div className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-600 text-white">
                            Produto unificado
                          </span>
                          <h4 className="text-sm font-bold">{group.name}</h4>
                        </div>

                        {bestPrice && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-600">Melhor preço:</span>
                            <span className="text-lg font-bold text-green-600">{brl(bestPrice.priceVista)}</span>
                            <span className="text-xs text-gray-500">em {getProviderName(bestPrice.provider)}</span>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mb-3">
                          {groupFavs.length} {groupFavs.length === 1 ? 'loja' : 'lojas'} disponíveis
                        </div>

                        <button
                          onClick={() => toggleGroupExpansion(group.id)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {isExpanded ? '▼ Ocultar detalhes' : '▶ Ver todas as lojas'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-blue-200">
                          {groupFavs.map((f) => {
                            const last = latestById?.[f.id];
                            const prev = prevById?.[f.id];
                            const shimmering = isShimmering(f.id);
                            const priceInfo = groupPrices.find(p => p.productId === f.id);
                            const isBestPrice = bestPrice?.productId === f.id;

                            return (
                              <ProductCard
                                key={f.id}
                                favorite={f}
                                latest={last}
                                prev={prev}
                                isShimmering={shimmering}
                                isBestPrice={isBestPrice}
                                provider={priceInfo?.provider}
                                onRefresh={() => onRefreshOne?.(f.id)}
                                menuOpen={openMenuId === f.id}
                                onMenuToggle={() => setOpenMenuId((id) => (id === f.id ? null : f.id))}
                                onMenuClose={() => setOpenMenuId(null)}
                              />
                            );
                          })}
                        </div>

                        {/* Comparativo de histórico do grupo */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium">Histórico Comparativo</h4>
                            <div className="flex gap-2">
                              {(['vista', 'parcelado', 'original'] as const).map(m => (
                                <button
                                  key={m}
                                  onClick={() => setGroupMetric(m)}
                                  className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                                    groupMetric === m
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {m === 'vista' ? 'À vista' : m === 'parcelado' ? 'Parcelado' : 'Original'}
                                </button>
                              ))}
                            </div>
                          </div>
                          <GroupCompareChart group={group} metric={groupMetric} />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.li>
              );
            }

            // Produto individual (não agrupado)
            const f = item.favorite;
            const last = latestById?.[f.id];
            const prev = prevById?.[f.id];
            const sel = isSelected(f.id);
            const shimmering = isShimmering(f.id);

            return (
              <motion.li
                key={f.id}
                layout
                initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 30, delay: Math.min(idx * 0.03, 0.15) }}
                className="col-span-1"
              >
                <ProductCard
                  favorite={f}
                  latest={last}
                  prev={prev}
                  isSelected={sel}
                  isShimmering={shimmering}
                  onSelect={() => onToggleCompare?.(f.id)}
                  onMonitor={() => onMonitor(f.id)}
                  onRemove={() => onRemove(f.id)}
                  onRefresh={() => onRefreshOne?.(f.id)}
                  menuOpen={openMenuId === f.id}
                  onMenuToggle={() => setOpenMenuId((id) => (id === f.id ? null : f.id))}
                  onMenuClose={() => setOpenMenuId(null)}
                />
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </motion.div>
  );
}
