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

  // Calcula o desconto percentual
  const discountPercent = last?.priceVista && last?.priceOriginal && last.priceOriginal > last.priceVista
    ? Math.round(((last.priceOriginal - last.priceVista) / last.priceOriginal) * 100)
    : 0;

  return (
    <motion.div
      className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/40 shadow-lg p-6"
      initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      role="region"
      aria-label="Informações de preço"
    >
      {/* Layout Horizontal */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">

        {/* Preço Principal - À Vista */}
        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Melhor Preço
              </div>
              <div className="text-5xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent" aria-label={`Preço à vista ${brl(last?.priceVista ?? null)}`}>
                {brl(last?.priceVista ?? null)}
              </div>
              <div className="text-sm text-emerald-600 font-medium mt-1">
                💰 À vista (PIX)
              </div>
            </div>

            {/* Badge de Desconto */}
            {discountPercent > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                -{discountPercent}%
              </div>
            )}
          </div>
        </div>

        {/* Separador Vertical */}
        <div className="hidden lg:block w-px h-20 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

        {/* Preço Parcelado */}
        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Parcelado
          </div>
          <div className="text-3xl font-bold text-gray-800" aria-label={`Preço parcelado ${brl(last?.priceParcelado ?? null)}`}>
            {brl(last?.priceParcelado ?? null)}
          </div>
          {(product.installmentsCount && product.installmentsValue) ? (
            <div className="text-sm text-gray-600 mt-1" aria-label={`Em até ${product.installmentsCount} vezes de ${brl(product.installmentsValue)} sem juros`}>
              <span className="font-medium">{product.installmentsCount}x</span> de <span className="font-semibold text-violet-600">{brl(product.installmentsValue)}</span>
              <span className="text-xs text-emerald-600 ml-1">sem juros</span>
            </div>
          ) : (
            <div className="text-sm text-gray-400 mt-1">Parcelamento não disponível</div>
          )}
        </div>

        {/* Separador Vertical */}
        <div className="hidden lg:block w-px h-20 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

        {/* Preço Original (De/Por) */}
        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Preço Original
          </div>
          <div
            className="text-2xl font-bold line-through decoration-2 decoration-red-400 text-gray-400"
            aria-label={`Preço original ${brl(last?.priceOriginal ?? null)}`}
          >
            {brl(last?.priceOriginal ?? null)}
          </div>
          {discountPercent > 0 ? (
            <div className="text-sm text-emerald-600 font-medium mt-1">
              ✅ Você economiza {brl((last?.priceOriginal ?? 0) - (last?.priceVista ?? 0))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 mt-1">Sem desconto no momento</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
