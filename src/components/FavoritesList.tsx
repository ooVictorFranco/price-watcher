// src/components/FavoritesList.tsx
'use client';

import { Favorite, Snapshot } from '@/types';
import { brl, externalUrlFromId, FAV_LIMIT } from '@/lib/utils';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

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

function DiffArrow({ curr, prev }: { curr?: number | null; prev?: number | null }) {
  if (curr == null || prev == null) return <span className="text-gray-400">—</span>;
  if (curr > prev) return <span className="text-red-600" title="Subiu">▼</span>;
  if (curr < prev) return <span className="text-green-600" title="Caiu">▲</span>;
  return <span className="text-gray-400">—</span>;
}

export default function FavoritesList({
  favorites, onMonitor, onRemove, latestById, prevById,
  onRefreshAll, onRefreshOne, loadingAll, compareSelected = [], onToggleCompare, shimmeringIds = [],
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const prefersReduced = useReducedMotion();

  const isSelected = (id: string) => compareSelected.includes(id);
  const isShimmering = (id: string) => shimmeringIds.includes(id);

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
          Nenhum favorito ainda. Use “Favoritar” no produto monitorado. Limite: {FAV_LIMIT} itens.
        </p>
      ) : (
        <motion.ul layout className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {favorites.map((f, idx) => {
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
                className={`group relative rounded-xl border p-3 flex gap-3 cursor-pointer transition
                  hover:shadow-md ${sel ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/30' : 'bg-white'}`}
                onClick={() => onToggleCompare?.(f.id)}
                role="button"
                aria-pressed={sel}
                aria-busy={shimmering}
                data-busy={shimmering ? 'true' : 'false'}
                whileHover={{ scale: prefersReduced ? 1 : 1.01 }}
                whileTap={{ scale: prefersReduced ? 1 : 0.99 }}
              >
                <div className="absolute left-2 top-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={sel}
                    onChange={() => onToggleCompare?.(f.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Selecionar para comparar"
                  />
                </div>

                {shimmering ? (
                  <div className="h-16 w-16 rounded-lg skeleton" />
                ) : f.image ? (
                  <motion.img
                    src={f.image}
                    alt={f.name}
                    className="h-16 w-16 rounded-lg object-contain bg-gray-50"
                    whileHover={{ rotate: prefersReduced ? 0 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-gray-100 grid place-items-center text-lg">⭐</div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    {shimmering ? (
                      <div className="h-4 w-3/4 rounded-md skeleton" />
                    ) : (
                      <p className="text-sm font-medium line-clamp-2 pr-8">{f.name}</p>
                    )}

                    {/* menu suspenso */}
                    <div className="ml-auto relative" onClick={(e) => e.stopPropagation()}>
                      <motion.button
                        whileHover={{ scale: prefersReduced ? 1 : 1.05 }}
                        whileTap={{ scale: prefersReduced ? 1 : 0.95 }}
                        className="rounded-md px-2 py-1 text-lg leading-none hover:bg-gray-100 disabled:opacity-50"
                        disabled={shimmering}
                        onClick={() => setOpenMenuId((id) => (id === f.id ? null : f.id))}
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === f.id}
                        aria-label="Mais opções"
                        title="Mais opções"
                      >
                        ⋯
                      </motion.button>

                      <AnimatePresence>
                        {openMenuId === f.id && !shimmering && (
                          <motion.div
                            initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.96, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: prefersReduced ? 1 : 0.98, y: -4 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                            className="absolute right-0 z-10 mt-1 w-48 rounded-lg border bg-white shadow-lg overflow-hidden"
                            role="menu"
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            {/* NOVO: atualizar um item só */}
                            <button
                              onClick={() => { setOpenMenuId(null); onRefreshOne?.(f.id); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                              role="menuitem"
                              disabled={shimmering}
                            >
                              Atualizar agora
                            </button>
                            <a
                              href={externalUrlFromId(f.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                              role="menuitem"
                            >
                              Ver na loja
                            </a>
                            <button
                              onClick={() => { setOpenMenuId(null); onRemove(f.id); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                              role="menuitem"
                            >
                              Remover
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] leading-4 select-none">
                    {[0,1,2].map((i) => (
                      <motion.div
                        key={i}
                        layout
                        className="rounded-md bg-gray-50 p-2"
                        whileHover={{ scale: prefersReduced ? 1 : 1.01 }}
                      >
                        {shimmering ? (
                          <>
                            <div className="h-3 w-14 rounded skeleton mb-2" />
                            <div className="h-4 w-20 rounded skeleton" />
                          </>
                        ) : (
                          <>
                            <div className="text-gray-500">
                              {i === 0 ? 'À vista' : i === 1 ? 'Parcelado' : 'Original'}
                            </div>
                            <div className="font-semibold flex items-center gap-1">
                              {i === 0 && brl(last?.priceVista ?? null)}
                              {i === 1 && brl(last?.priceParcelado ?? null)}
                              {i === 2 && brl(last?.priceOriginal ?? null)}
                              {i === 0 && <DiffArrow curr={last?.priceVista} prev={prev?.priceVista} />}
                              {i === 1 && <DiffArrow curr={last?.priceParcelado} prev={prev?.priceParcelado} />}
                              {i === 2 && <DiffArrow curr={last?.priceOriginal} prev={prev?.priceOriginal} />}
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <motion.button
                      whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
                      whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
                      onClick={(e) => { e.stopPropagation(); onMonitor(f.id); }}
                      className="rounded-lg px-3 py-2 text-sm border hover:bg-gray-50 disabled:opacity-50 transition"
                      title="Abrir monitoramento deste produto"
                      disabled={shimmering}
                    >
                      Monitorar
                    </motion.button>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </motion.div>
  );
}
