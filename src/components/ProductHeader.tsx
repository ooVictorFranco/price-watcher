// src/components/ProductHeader.tsx
'use client';

import dayjs from 'dayjs';
import { ProductInfo, Snapshot } from '@/types';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

type Props = {
  product: ProductInfo;
  last: Snapshot | undefined;
  discountPct: number | null;
  onRefresh: () => void;
  onFavorite?: () => void;
  onClear?: () => void;
  isFav?: boolean;
  loading?: boolean;
};

export default function ProductHeader({
  product,
  discountPct,
  onRefresh,
  onFavorite,
  onClear,
  isFav,
  loading,
}: Props) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className="rounded-2xl border bg-white shadow-md p-5"
      initial={{ opacity: 0, y: prefersReduced ? 0 : -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="region"
      aria-label="Cabeçalho do produto"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {product.image ? (
          <motion.div
            className="relative h-20 w-20 rounded-xl bg-gray-50 border flex-shrink-0"
            whileHover={{ rotate: prefersReduced ? 0 : 2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Image
              src={product.image}
              alt={product.name ?? 'Produto'}
              fill
              className="rounded-xl object-contain p-2"
              sizes="80px"
            />
          </motion.div>
        ) : (
          <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 grid place-items-center text-xl flex-shrink-0" aria-label="Sem imagem">
            🛒
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold line-clamp-2 mb-2">{product.name ?? 'Produto'}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <time className="text-xs text-gray-500" dateTime={dayjs(product.lastCheck).toISOString()}>
              Última checagem: {dayjs(product.lastCheck).format('DD/MM/YYYY HH:mm')}
            </time>
            {discountPct != null && (
              <motion.span
                className="text-xs inline-flex items-center gap-1 rounded-full bg-green-100 border border-green-200 px-2.5 py-1 text-green-700 font-medium"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
                aria-label={`Desconto de ${discountPct}% em relação ao preço original`}
              >
                💰 desconto ~{discountPct}% vs original
              </motion.span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {onFavorite && (
            <motion.button
              onClick={onFavorite}
              className="border-2 hover:bg-gray-50 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
              whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
              aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              aria-pressed={isFav}
            >
              {isFav ? '★ Favorito' : '☆ Favoritar'}
            </motion.button>
          )}
          {onClear && (
            <motion.button
              onClick={onClear}
              className="border-2 hover:bg-gray-50 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
              whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
              aria-label="Limpar pesquisa atual"
            >
              Limpar
            </motion.button>
          )}
          <motion.button
            onClick={onRefresh}
            className="border-2 hover:bg-gray-50 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
            whileHover={{ scale: prefersReduced || loading ? 1 : 1.02 }}
            whileTap={{ scale: prefersReduced || loading ? 1 : 0.98 }}
            aria-label={loading ? 'Atualizando preço' : 'Atualizar preço agora'}
            aria-busy={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Atualizando…
              </span>
            ) : 'Checar agora'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
