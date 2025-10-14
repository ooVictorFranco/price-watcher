// src/components/FavoritesList.tsx
'use client';

import { Favorite, Snapshot, ProductGroup } from '@/types';
import {
  getGroupPrices,
  getBestPriceInGroup,
  loadProductGroups,
} from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import GroupCompareChart from './GroupCompareChart';
import ProductCard from './ProductCard';
import GroupCard from './GroupCard';

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
  onManageGroup?: (productId: string) => void;
  onRenameGroup?: (groupId: string, newName: string) => void;
  onDeleteGroup?: (groupId: string) => void;
};

export default function FavoritesList({
  favorites, onMonitor, onRemove, latestById, prevById,
  onRefreshAll, onRefreshOne, loadingAll, compareSelected = [], onToggleCompare, shimmeringIds = [],
  onManageGroup, onRenameGroup, onDeleteGroup,
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

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'grouped' | 'individual'>('all');

  const total = favorites.length;

  // Filtra favoritos baseado na busca e tipo
  const filteredGroupedFavorites = groupedFavorites.filter(item => {
    // Filtro por tipo
    if (filterType === 'grouped' && item.type !== 'group') return false;
    if (filterType === 'individual' && item.type !== 'single') return false;

    // Filtro por busca
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    if (item.type === 'group') {
      const groupMatches = item.group.name.toLowerCase().includes(query);
      const anyProductMatches = item.favorites.some(f =>
        f.name.toLowerCase().includes(query) || f.id.toLowerCase().includes(query)
      );
      return groupMatches || anyProductMatches;
    } else {
      return item.favorite.name.toLowerCase().includes(query) ||
             item.favorite.id.toLowerCase().includes(query);
    }
  });

  return (
    <motion.div
      className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/40 shadow-lg p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Header com título e contador */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              Meus Favoritos
            </h3>
            <div className="text-sm text-gray-600">
              {total} {total === 1 ? 'produto' : 'produtos'} • {filteredGroupedFavorites.length} {filteredGroupedFavorites.length === 1 ? 'item' : 'itens'} exibidos
            </div>
          </div>
        </div>

        {onRefreshAll && (
          <motion.button
            whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
            whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
            onClick={onRefreshAll}
            disabled={favorites.length === 0 || loadingAll}
            className="rounded-xl px-4 py-2 text-sm bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 text-violet-700 hover:from-violet-100 hover:to-blue-100 disabled:opacity-50 transition-all shadow-sm"
            title="Atualiza os preços de todos os favoritos"
          >
            {loadingAll ? 'Atualizando…' : 'Atualizar todos'}
          </motion.button>
        )}
      </div>

      {/* Barra de busca e filtros */}
      {favorites.length > 0 && (
        <div className="mb-6 space-y-3">
          <input
            type="text"
            placeholder="Buscar produtos por nome ou ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:shadow-lg"
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md'
                  : 'bg-white/60 border border-gray-200 text-gray-700 hover:bg-white/80'
              }`}
            >
              Todos ({groupedFavorites.length})
            </button>
            <button
              onClick={() => setFilterType('grouped')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filterType === 'grouped'
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md'
                  : 'bg-white/60 border border-gray-200 text-gray-700 hover:bg-white/80'
              }`}
            >
              Grupos ({groupedFavorites.filter(i => i.type === 'group').length})
            </button>
            <button
              onClick={() => setFilterType('individual')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filterType === 'individual'
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md'
                  : 'bg-white/60 border border-gray-200 text-gray-700 hover:bg-white/80'
              }`}
            >
              Individuais ({groupedFavorites.filter(i => i.type === 'single').length})
            </button>
          </div>
        </div>
      )}

      {favorites.length === 0 ? (
        <p className="text-sm text-gray-600">
          Nenhum favorito ainda. Use &quot;Favoritar&quot; no produto monitorado.
        </p>
      ) : (
        <ul className="space-y-3">
          {filteredGroupedFavorites.map((item) => {
            if (item.type === 'group') {
              const { group, favorites: groupFavs } = item;
              const bestPrice = getBestPriceInGroup(group.id);
              const isExpanded = expandedGroups.has(group.id);
              const groupPrices = getGroupPrices(group.id);

              return (
                <GroupCard
                  key={`group-${group.id}`}
                  group={group}
                  bestPrice={bestPrice}
                  productCount={groupFavs.length}
                  isExpanded={isExpanded}
                  onToggleExpand={() => toggleGroupExpansion(group.id)}
                  onRenameGroup={(newName) => onRenameGroup?.(group.id, newName)}
                  onDeleteGroup={() => onDeleteGroup?.(group.id)}
                >
                  <div className="transition-all duration-300 ease-out">
                        <div className="space-y-2 mt-3 pt-3 border-t border-violet-200/50">
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
                                onManageGroup={() => onManageGroup?.(f.id)}
                                isInGroup={!!f.groupId}
                                onRemove={() => onRemove(f.id)}
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
                      </div>
                </GroupCard>
              );
            }

            // Produto individual (não agrupado)
            const f = item.favorite;
            const last = latestById?.[f.id];
            const prev = prevById?.[f.id];
            const sel = isSelected(f.id);
            const shimmering = isShimmering(f.id);

            return (
              <li
                key={f.id}
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
                  onManageGroup={() => onManageGroup?.(f.id)}
                  isInGroup={!!f.groupId}
                />
              </li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}
