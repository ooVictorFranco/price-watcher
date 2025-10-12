// src/components/ProductHeader.tsx
'use client';

import dayjs from 'dayjs';
import { ProductInfo, Snapshot } from '@/types';

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
  return (
    <div className="rounded-2xl border bg-white shadow-md p-5">
      <div className="flex items-center gap-4">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name ?? 'Produto KaBuM'}
            className="h-20 w-20 rounded-xl object-contain bg-gray-100"
          />
        ) : (
          <div className="h-20 w-20 rounded-xl bg-gray-100 grid place-items-center text-xl">🛒</div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold line-clamp-2">{product.name ?? 'Produto'}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              Última checagem: {dayjs(product.lastCheck).format('DD/MM/YYYY HH:mm')}
            </span>
            {discountPct != null && (
              <span className="text-xs inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-green-700">
                desconto ~{discountPct}% vs original
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {onFavorite && (
            <button
              onClick={onFavorite}
              className="border hover:bg-gray-50 rounded-xl px-3 py-2 text-sm"
              title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              {isFav ? '★ Favorito' : '☆ Favoritar'}
            </button>
          )}
          {onClear && (
            <button
              onClick={onClear}
              className="border hover:bg-gray-50 rounded-xl px-3 py-2 text-sm"
              title="Limpar pesquisa atual"
            >
              Limpar
            </button>
          )}
          <button
            onClick={onRefresh}
            className="border hover:bg-gray-50 rounded-xl px-3 py-2 text-sm"
            disabled={loading}
          >
            Checar agora
          </button>
        </div>
      </div>
    </div>
  );
}
