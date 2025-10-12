// src/components/PriceCards.tsx
'use client';

import { ProductInfo, Snapshot } from '@/types';
import { brl } from '@/lib/utils';

type Props = {
  product: ProductInfo;
  last: Snapshot | undefined;
};

export default function PriceCards({ product, last }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="text-xs text-gray-500">À vista (PIX)</div>
        <div className="text-3xl font-extrabold tracking-tight">{brl(last?.priceVista ?? null)}</div>
      </div>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="text-xs text-gray-500">Parcelado (total)</div>
        <div className="text-3xl font-extrabold tracking-tight">{brl(last?.priceParcelado ?? null)}</div>
        {(product.installmentsCount && product.installmentsValue) ? (
          <div className="text-xs text-gray-600 mt-1">
            {`em até ${product.installmentsCount}x de ${brl(product.installmentsValue)}`}
          </div>
        ) : null}
      </div>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="text-xs text-gray-500">Preço original</div>
        <div className="text-3xl font-extrabold tracking-tight line-through decoration-2 decoration-gray-400">
          {brl(last?.priceOriginal ?? null)}
        </div>
      </div>
    </div>
  );
}
