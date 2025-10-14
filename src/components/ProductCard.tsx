// src/components/ProductCard.tsx
'use client';

import { Snapshot, Favorite } from '@/types';
import { brl, externalUrlFromId, timeAgo, getProviderName } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

type DiffArrowProps = {
  curr?: number | null;
  prev?: number | null;
};

function DiffArrow({ curr, prev }: DiffArrowProps) {
  if (curr == null || prev == null) return null;
  if (curr > prev) return <span className="text-red-600" title="Preço subiu" aria-label="Preço subiu">▲</span>;
  if (curr < prev) return <span className="text-green-600" title="Preço caiu" aria-label="Preço caiu">▼</span>;
  return null;
}

type ProductCardProps = {
  favorite: Favorite;
  latest?: Snapshot;
  prev?: Snapshot;
  isSelected?: boolean;
  isShimmering?: boolean;
  isBestPrice?: boolean;
  provider?: 'kabum' | 'amazon';
  onSelect?: () => void;
  onMonitor?: () => void;
  onRemove?: () => void;
  onRefresh?: () => void;
  menuOpen?: boolean;
  onMenuToggle?: () => void;
  onMenuClose?: () => void;
  onManageGroup?: () => void;
  isInGroup?: boolean;
};

export default function ProductCard({
  favorite,
  latest,
  prev,
  isSelected = false,
  isShimmering = false,
  isBestPrice = false,
  provider,
  onSelect,
  onMonitor,
  onRemove,
  onRefresh,
  menuOpen = false,
  onMenuToggle,
  onMenuClose,
  onManageGroup,
  isInGroup = false,
}: ProductCardProps) {
  const prefersReduced = useReducedMotion();

  // Calcula installments se houver priceParcelado
  const installments = latest?.priceParcelado && latest.priceParcelado > (latest.priceVista || 0)
    ? {
        // Estimativa: assume 10x como padrão (pode ser melhorado com dados reais)
        count: 10,
        value: latest.priceParcelado / 10,
      }
    : null;

  return (
    <div
      className={`relative rounded-xl border p-3 cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-violet-500 border-violet-500 bg-violet-50/30 shadow-lg' : 'bg-white/60 border-gray-200 hover:shadow-md'}
        ${isBestPrice ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-lg' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-busy={isShimmering}
      aria-label={`${favorite.name}${isSelected ? ', selecionado' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
    >
      {/* Badge melhor preço */}
      {isBestPrice && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md z-10" aria-label="Melhor preço">
          💰 MELHOR PREÇO
        </div>
      )}

      {/* Checkbox de seleção */}
      {onSelect && (
        <div className="absolute left-3 top-3 z-10">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 focus:ring-2"
            checked={isSelected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Selecionar ${favorite.name} para comparar`}
          />
        </div>
      )}

      {/* Menu de opções */}
      {(onRefresh || onRemove) && (
        <div
          className="absolute right-3 top-3 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            whileHover={{ scale: prefersReduced ? 1 : 1.05 }}
            whileTap={{ scale: prefersReduced ? 1 : 0.95 }}
            className="rounded-md px-2 py-1 text-lg leading-none hover:bg-gray-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
            disabled={isShimmering}
            onClick={onMenuToggle}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Mais opções"
          >
            ⋯
          </motion.button>

          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 mt-1 w-56 rounded-lg border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden z-50"
              role="menu"
              onMouseLeave={onMenuClose}
            >
              {onRefresh && (
                <button
                  onClick={() => { onMenuClose?.(); onRefresh(); }}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                  role="menuitem"
                  disabled={isShimmering}
                >
                  🔄 Atualizar agora
                </button>
              )}
              <a
                href={externalUrlFromId(favorite.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                role="menuitem"
              >
                🔗 Ver na loja
              </a>
              {onManageGroup && (
                <>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={() => { onMenuClose?.(); onManageGroup(); }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-violet-600"
                    role="menuitem"
                  >
                    {isInGroup ? '📦 Gerenciar grupo' : '➕ Adicionar a grupo'}
                  </button>
                </>
              )}
              {onRemove && (
                <>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={() => { onMenuClose?.(); onRemove(); }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-red-600"
                    role="menuitem"
                  >
                    🗑️ Remover dos favoritos
                  </button>
                </>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Layout Horizontal */}
      <div className="flex gap-4 items-center">
        {/* Imagem do produto */}
        <div className="flex-shrink-0">
          {isShimmering ? (
            <div className="h-20 w-20 rounded-lg skeleton" role="status" aria-label="Carregando" />
          ) : favorite.image ? (
            <div className="relative h-20 w-20 rounded-lg bg-gray-50 border border-gray-100">
              <Image
                src={favorite.image}
                alt={favorite.name}
                fill
                className="rounded-lg object-contain p-1"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 grid place-items-center text-2xl border border-gray-100" aria-label="Sem imagem">
              ⭐
            </div>
          )}
        </div>

        {/* Info do Produto */}
        <div className="flex-1 min-w-0">
          {/* Nome e Badge */}
          <div className="flex items-start gap-2 mb-2">
            {isShimmering ? (
              <div className="h-8 w-full rounded-md skeleton" role="status" />
            ) : (
              <>
                <h5 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">
                  {favorite.name}
                </h5>
                {provider && (
                  <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 border border-violet-200">
                    {getProviderName(provider)}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Timestamp */}
          {!isShimmering && latest?.timestamp && (
            <time className="text-[10px] text-gray-400 block mb-2" dateTime={new Date(latest.timestamp).toISOString()}>
              Atualizado {timeAgo(latest.timestamp)}
            </time>
          )}

          {/* Preços em linha */}
          <div className="flex flex-wrap gap-2">
            {/* Preço Original */}
            {latest?.priceOriginal && (
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-gray-500">De:</span>
                <span className="text-gray-400 line-through">{brl(latest.priceOriginal)}</span>
                <DiffArrow curr={latest.priceOriginal} prev={prev?.priceOriginal} />
              </div>
            )}

            {/* Separador */}
            {latest?.priceOriginal && latest?.priceVista && (
              <span className="text-gray-300">•</span>
            )}

            {/* Preço À Vista */}
            {latest?.priceVista && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-emerald-700 font-medium">À vista:</span>
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {brl(latest.priceVista)}
                </span>
                <DiffArrow curr={latest.priceVista} prev={prev?.priceVista} />
              </div>
            )}

            {/* Separador */}
            {latest?.priceVista && latest?.priceParcelado && (
              <span className="text-gray-300">•</span>
            )}

            {/* Preço Parcelado */}
            {latest?.priceParcelado && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-gray-600">Parc:</span>
                <span className="text-sm font-semibold text-gray-700">
                  {brl(latest.priceParcelado)}
                </span>
                <DiffArrow curr={latest.priceParcelado} prev={prev?.priceParcelado} />
              </div>
            )}

            {/* Parcelas */}
            {installments && installments.count > 1 && (
              <div className="text-[10px] text-gray-500">
                ({installments.count}x de {brl(installments.value)})
              </div>
            )}
          </div>
        </div>

        {/* Botão de ação */}
        {onMonitor && (
          <div className="flex-shrink-0">
            <motion.button
              whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
              whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
              onClick={(e) => { e.stopPropagation(); onMonitor(); }}
              className="rounded-lg px-4 py-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              disabled={isShimmering}
              aria-label={`Monitorar ${favorite.name}`}
            >
              Monitorar
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
