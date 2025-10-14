'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

type RecentProduct = {
  id: string;
  productId: string;
  provider: string;
  name: string;
  image: string | null;
  lastCheckedAt: Date | null;
};

type Props = {
  onProductClick: (productId: string) => void;
};

export default function RecentSearches({ onProductClick }: Props) {
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    fetchRecentProducts();
  }, []);

  const fetchRecentProducts = async () => {
    try {
      const response = await fetch('/api/products/recent');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching recent products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Procurados recentemente
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 h-48 bg-white/60 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">
        🔥 Procurados recentemente
      </h2>
      <p className="text-sm text-gray-600">
        Veja o que outros usuários estão pesquisando em tempo real
      </p>

      {/* Carrossel infinito com animação */}
      <div className="relative overflow-hidden">
        {/* Gradiente esquerdo */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />

        {/* Gradiente direito */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

        {/* Container do carrossel */}
        <motion.div
          className="flex gap-4 py-4"
          animate={
            prefersReduced
              ? {}
              : {
                  x: [0, -1000],
                }
          }
          transition={
            prefersReduced
              ? {}
              : {
                  x: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: 30,
                    ease: 'linear',
                  },
                }
          }
        >
          {/* Duplica os produtos para criar efeito infinito */}
          {[...products, ...products].map((product, index) => (
            <motion.button
              key={`${product.id}-${index}`}
              onClick={() => onProductClick(product.productId)}
              className="flex-shrink-0 w-40 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden group focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              whileHover={prefersReduced ? {} : { scale: 1.05, y: -5 }}
              whileTap={prefersReduced ? {} : { scale: 0.98 }}
            >
              {/* Badge do Provider */}
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-md shadow-sm ${
                      product.provider === 'kabum'
                        ? 'bg-orange-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {product.provider === 'kabum' ? 'KaBuM!' : 'Amazon'}
                  </span>
                </div>

                {/* Imagem do produto */}
                {product.image ? (
                  <div className="relative h-32 w-full bg-gray-50">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-3 group-hover:scale-110 transition-transform duration-300"
                      sizes="160px"
                    />
                  </div>
                ) : (
                  <div className="h-32 w-full bg-gradient-to-br from-gray-100 to-gray-200 grid place-items-center text-3xl">
                    🛒
                  </div>
                )}
              </div>

              {/* Nome do produto */}
              <div className="p-3">
                <p className="text-xs font-medium text-gray-800 line-clamp-2 text-left">
                  {product.name}
                </p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Clique em um produto para ver o histórico de preços
      </p>
    </section>
  );
}
