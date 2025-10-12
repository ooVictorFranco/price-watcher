// src/components/FavoritesList.tsx
'use client';

import { Favorite, Snapshot } from '@/types';
import { brl, kabumUrlForId } from '@/lib/utils';
import { useState } from 'react';

type Props = {
  favorites: Favorite[];
  onMonitor: (id: string) => void;
  onRemove: (id: string) => void;
  /** Último snapshot por ID (valores atuais) */
  latestById?: Record<string, Snapshot | undefined>;
  /** Penúltimo snapshot por ID (para setas ▲▼) */
  prevById?: Record<string, Snapshot | undefined>;
  /** Atualizar todos os favoritos */
  onRefreshAll?: () => void;
  loadingAll?: boolean;
  /** Seleção para comparativo (ids) */
  compareSelected?: string[];
  onToggleCompare?: (id: string) => void;
  /** IDs que estão com atualização em andamento → aplicamos shimmer nestes cards */
  shimmeringIds?: string[];
};

function DiffArrow({ curr, prev }: { curr?: number | null; prev?: number | null }) {
  if (curr == null || prev == null) return <span className="text-gray-400">—</span>;
  if (curr > prev) return <span className="text-red-600" title="Subiu">▼</span>;   // preço maior = pior (seta para baixo vermelha)
  if (curr < prev) return <span className="text-green-600" title="Caiu">▲</span>;  // preço menor = melhor (seta para cima verde)
  return <span className="text-gray-400">—</span>;
}

export default function FavoritesList({
  favorites,
  onMonitor,
  onRemove,
  latestById,
  prevById,
  onRefreshAll,
  loadingAll,
  compareSelected = [],
  onToggleCompare,
  shimmeringIds = [],
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const isSelected = (id: string) => compareSelected.includes(id);
  const isShimmering = (id: string) => shimmeringIds.includes(id);

  return (
    <div className="rounded-2xl border bg-white shadow-md p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Favoritos</h3>
          <span className="text-xs text-gray-500">{favorites.length} itens</span>
        </div>

        {onRefreshAll && (
          <button
            onClick={onRefreshAll}
            disabled={favorites.length === 0 || loadingAll}
            className="rounded-lg px-3 py-2 text-sm border hover:bg-gray-50 disabled:opacity-50"
            title="Atualiza os preços de todos os favoritos"
          >
            {loadingAll ? 'Atualizando…' : 'Atualizar todos'}
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <p className="text-sm text-gray-600">
          Nenhum favorito ainda. Use “Favoritar” no produto monitorado.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {favorites.map((f) => {
            const last = latestById?.[f.id];
            const prev = prevById?.[f.id];
            const sel = isSelected(f.id);
            const shimmering = isShimmering(f.id);

            return (
              <li
                key={f.id}
                className={`group relative rounded-xl border p-3 flex gap-3 cursor-pointer transition
                  hover:shadow-md ${sel ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/30' : 'bg-white'}`}
                onClick={() => onToggleCompare?.(f.id)}
                role="button"
                aria-pressed={sel}
                aria-busy={shimmering}
                data-busy={shimmering ? 'true' : 'false'}
              >
                {/* checkbox de seleção */}
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

                {/* imagem */}
                {shimmering ? (
                  <div className="h-16 w-16 rounded-lg skeleton" />
                ) : f.image ? (
                  <img
                    src={f.image}
                    alt={f.name}
                    className="h-16 w-16 rounded-lg object-contain bg-gray-50"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-gray-100 grid place-items-center text-lg">⭐</div>
                )}

                {/* conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    {shimmering ? (
                      <div className="h-4 w-3/4 rounded-md skeleton" />
                    ) : (
                      <p className="text-sm font-medium line-clamp-2 pr-8">{f.name}</p>
                    )}

                    {/* menu suspenso (três pontos) */}
                    <div className="ml-auto relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="rounded-md px-2 py-1 text-lg leading-none hover:bg-gray-100 disabled:opacity-50"
                        disabled={shimmering}
                        onClick={() => setOpenMenuId((id) => (id === f.id ? null : f.id))}
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === f.id}
                        aria-label="Mais opções"
                        title="Mais opções"
                      >
                        ⋯
                      </button>
                      {openMenuId === f.id && !shimmering && (
                        <div
                          className="absolute right-0 z-10 mt-1 w-44 rounded-lg border bg-white shadow-lg overflow-hidden"
                          role="menu"
                          onMouseLeave={() => setOpenMenuId(null)}
                        >
                          <a
                            href={kabumUrlForId(f.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                            role="menuitem"
                          >
                            Ver no KaBuM!
                          </a>
                          <button
                            onClick={() => { setOpenMenuId(null); onRemove(f.id); }}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                            role="menuitem"
                          >
                            Remover
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* preços (3 blocos) com shimmer quando atualizando */}
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] leading-4 select-none">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="rounded-md bg-gray-50 p-2">
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
                      </div>
                    ))}
                  </div>

                  {/* ação primária */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onMonitor(f.id); }}
                      className="rounded-lg px-3 py-2 text-sm border hover:bg-gray-50 disabled:opacity-50"
                      title="Abrir monitoramento deste produto"
                      disabled={shimmering}
                    >
                      Monitorar
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
