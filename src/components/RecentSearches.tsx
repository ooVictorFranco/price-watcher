'use client';

import { useEffect, useState, useRef } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecentProducts();

    // Atualiza os produtos a cada 30 segundos
    const interval = setInterval(() => {
      fetchRecentProducts();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Loop automático do carrossel
  useEffect(() => {
    if (prefersReduced || products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000); // Avança automaticamente a cada 5 segundos

    return () => clearInterval(interval);
  }, [products.length, prefersReduced]);

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

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  // Calcula o offset baseado no índice atual
  const cardWidth = 176; // 160px + 16px gap
  const offset = -currentIndex * cardWidth;

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

      {/* Carrossel com controles de navegação */}
      <div className="relative">
        {/* Botão Anterior */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white backdrop-blur-sm border border-gray-200 rounded-full p-3 shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-violet-500"
          aria-label="Produto anterior"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Botão Próximo */}
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white backdrop-blur-sm border border-gray-200 rounded-full p-3 shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-violet-500"
          aria-label="Próximo produto"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Container do carrossel */}
        <div className="overflow-hidden px-4" ref={containerRef}>
          <motion.div
            className="flex gap-4 py-4"
            animate={{ x: offset }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            {/* Triplica os produtos para criar efeito infinito suave */}
            {[...products, ...products, ...products].map((product, index) => (
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

        {/* Indicadores de posição */}
        <div className="flex justify-center gap-2 mt-4">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                index === currentIndex
                  ? 'w-8 bg-violet-600'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir para produto ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Clique em um produto para ver o histórico de preços • Avança automaticamente a cada 5s
      </p>
    </section>
  );
}
