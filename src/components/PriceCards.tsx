// src/components/PriceCards.tsx
'use client';

import { ProductInfo, Snapshot } from '@/types';
import { brl } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';

type Props = {
  product: ProductInfo;
  last: Snapshot | undefined;
};

export default function PriceCards({ product, last }: Props) {
  const prefersReduced = useReducedMotion();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5" role="region" aria-label="Informações de preço">
      <motion.div
        className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-4"
        initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 28 }}
        whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
      >
        <div className="text-xs font-medium text-green-700 mb-2">À vista (PIX)</div>
        <div className="text-3xl font-extrabold tracking-tight text-green-900" aria-label={`Preço à vista ${brl(last?.priceVista ?? null)}`}>
          {brl(last?.priceVista ?? null)}
        </div>
        <div className="text-[10px] text-green-600 mt-1">Melhor oferta</div>
      </motion.div>

      <motion.div
        className="rounded-xl bg-gray-50 border border-gray-200 p-4"
        initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 28 }}
        whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
      >
        <div className="text-xs font-medium text-gray-600 mb-2">Parcelado (total)</div>
        <div className="text-3xl font-extrabold tracking-tight text-gray-900" aria-label={`Preço parcelado ${brl(last?.priceParcelado ?? null)}`}>
          {brl(last?.priceParcelado ?? null)}
        </div>
        {(product.installmentsCount && product.installmentsValue) ? (
          <div className="text-xs text-gray-600 mt-2" aria-label={`Em até ${product.installmentsCount} vezes de ${brl(product.installmentsValue)} sem juros`}>
            {`em até ${product.installmentsCount}x de ${brl(product.installmentsValue)}`}
            <span className="text-[10px] text-green-600 ml-1">sem juros</span>
          </div>
        ) : null}
      </motion.div>

      <motion.div
        className="rounded-xl bg-gray-50 border border-gray-200 p-4"
        initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 28 }}
        whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
      >
        <div className="text-xs font-medium text-gray-500 mb-2">Preço original</div>
        <div
          className="text-3xl font-extrabold tracking-tight line-through decoration-2 decoration-red-400 text-gray-400"
          aria-label={`Preço original ${brl(last?.priceOriginal ?? null)}`}
        >
          {brl(last?.priceOriginal ?? null)}
        </div>
        {last?.priceVista && last?.priceOriginal && last.priceOriginal > last.priceVista && (
          <div className="text-[10px] text-green-600 mt-1">
            -{Math.round(((last.priceOriginal - last.priceVista) / last.priceOriginal) * 100)}% de desconto
          </div>
        )}
      </motion.div>
    </div>
  );
}
