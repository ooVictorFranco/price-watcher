// src/components/ProductCard.tsx
'use client';

import { Snapshot, Favorite } from '@/types';
import { brl, externalUrlFromId, timeAgo, getProviderName } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

type PriceDisplayProps = {
  label: string;
  price: number | null;
  arrow?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'muted';
  installments?: { count: number; value: number } | null;
};

function PriceDisplay({ label, price, arrow, variant = 'default', installments }: PriceDisplayProps) {
  if (!price) return null;

  const styles = {
    default: {
      bg: 'bg-gray-50',
      border: '',
      labelColor: 'text-gray-600',
      priceColor: 'text-gray-900',
      priceSize: 'text-lg',
    },
    highlight: {
      bg: 'bg-green-50',
      border: 'border border-green-200',
      labelColor: 'text-green-700',
      priceColor: 'text-green-600',
      priceSize: 'text-2xl',
    },
    muted: {
      bg: 'bg-gray-50',
      border: '',
      labelColor: 'text-gray-500',
      priceColor: 'text-gray-400',
      priceSize: 'text-sm',
    },
  }[variant];

  return (
    <div className={`flex flex-col gap-1 px-3 py-2 rounded-lg ${styles.bg} ${styles.border}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${styles.labelColor}`}>{label}</span>
        {arrow && <span className="ml-2">{arrow}</span>}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className={`font-bold ${styles.priceColor} ${styles.priceSize} ${variant === 'muted' ? 'line-through' : ''}`}>
          {brl(price)}
        </span>
      </div>
      {installments && installments.count > 1 && (
        <div className="text-[11px] text-gray-500">
          {installments.count}x de {brl(installments.value)} sem juros
        </div>
      )}
    </div>
  );
}

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
    <motion.div
      className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/30 shadow-lg' : 'bg-white border-gray-200 hover:shadow-md'}
        ${isBestPrice ? 'ring-2 ring-green-500 border-green-500 shadow-lg' : ''}`}
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
      whileHover={{ scale: prefersReduced ? 1 : 1.01 }}
      whileTap={{ scale: prefersReduced ? 1 : 0.99 }}
    >
      {/* Badge melhor preço */}
      {isBestPrice && (
        <div className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md z-10" aria-label="Melhor preço">
          💰 MELHOR PREÇO
        </div>
      )}

      {/* Checkbox de seleção */}
      {onSelect && (
        <div className="absolute left-3 top-3 z-10">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
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
            className="rounded-md px-2 py-1 text-lg leading-none hover:bg-gray-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: prefersReduced ? 1 : 0.98, y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              className="absolute right-0 mt-1 w-48 rounded-lg border bg-white shadow-lg overflow-hidden"
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
                  Atualizar agora
                </button>
              )}
              <a
                href={externalUrlFromId(favorite.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                role="menuitem"
              >
                Ver na loja
              </a>
              {onRemove && (
                <button
                  onClick={() => { onMenuClose?.(); onRemove(); }}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-red-600"
                  role="menuitem"
                >
                  Remover
                </button>
              )}
            </motion.div>
          )}
        </div>
      )}

      <div className="flex flex-col items-center pt-6">
        {/* Imagem do produto */}
        {isShimmering ? (
          <div className="h-32 w-32 rounded-lg skeleton mb-4" role="status" aria-label="Carregando" />
        ) : favorite.image ? (
          <motion.div
            className="relative h-32 w-32 rounded-lg bg-gray-50 border mb-4"
            whileHover={{ rotate: prefersReduced ? 0 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Image
              src={favorite.image}
              alt={favorite.name}
              fill
              className="rounded-lg object-contain p-2"
              sizes="128px"
            />
          </motion.div>
        ) : (
          <div className="h-32 w-32 rounded-lg bg-gray-100 grid place-items-center text-3xl border mb-4" aria-label="Sem imagem">
            ⭐
          </div>
        )}

        {/* Badge da loja (se provider fornecido) */}
        {provider && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 border border-blue-200 mb-2">
            {getProviderName(provider)}
          </span>
        )}

        {/* Nome do produto */}
        {isShimmering ? (
          <div className="h-10 w-full rounded-md skeleton mb-3" role="status" />
        ) : (
          <h5 className="text-sm font-medium text-gray-900 text-center line-clamp-2 mb-2 min-h-[40px]">
            {favorite.name}
          </h5>
        )}

        {/* Timestamp */}
        {!isShimmering && latest?.timestamp && (
          <time className="text-[10px] text-gray-400 mb-3" dateTime={new Date(latest.timestamp).toISOString()}>
            Atualizado {timeAgo(latest.timestamp)}
          </time>
        )}

        {/* Seção de preços */}
        <div className="w-full space-y-2 mb-4">
          <PriceDisplay
            label="De:"
            price={latest?.priceOriginal ?? null}
            arrow={<DiffArrow curr={latest?.priceOriginal} prev={prev?.priceOriginal} />}
            variant="muted"
          />

          <PriceDisplay
            label="À vista"
            price={latest?.priceVista ?? null}
            arrow={<DiffArrow curr={latest?.priceVista} prev={prev?.priceVista} />}
            variant="highlight"
          />

          <PriceDisplay
            label="Parcelado"
            price={latest?.priceParcelado ?? null}
            arrow={<DiffArrow curr={latest?.priceParcelado} prev={prev?.priceParcelado} />}
            variant="default"
            installments={installments}
          />
        </div>

        {/* Botão de ação */}
        {onMonitor && (
          <motion.button
            whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
            whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
            onClick={(e) => { e.stopPropagation(); onMonitor(); }}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isShimmering}
            aria-label={`Monitorar ${favorite.name}`}
          >
            Monitorar Produto
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
