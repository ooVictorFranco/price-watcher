'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion, useMotionValue, useAnimationFrame } from 'framer-motion';
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

const MAX_PRODUCTS = 10;
const CARD_WIDTH = 176; // 160px + 16px gap
const AUTO_SCROLL_SPEED = 28; // px/s para um movimento contínuo
const LOOP_MULTIPLIER = 3;
const REFRESH_MIN_MS = 7000;
const REFRESH_MAX_MS = 14000;

const getProductKey = (product: RecentProduct) => `${product.provider}:${product.productId}`;

const shuffleArray = <T,>(input: T[]): T[] => {
  const arr = [...input];
  if (arr.length <= 1) return arr;

  const cryptoRef = typeof globalThis !== 'undefined' && 'crypto' in globalThis ? globalThis.crypto : undefined;
  if (cryptoRef && typeof cryptoRef.getRandomValues === 'function') {
    const buffer = new Uint32Array(arr.length);
    cryptoRef.getRandomValues(buffer);
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = buffer[i] % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function RecentSearches({ onProductClick }: Props) {
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(false);
  const productsLengthRef = useRef(0);
  const visibleCountRef = useRef(3);
  const x = useMotionValue(0);
  const offsetRef = useRef(0);
  const lastSwapIndexRef = useRef<number>(-1);

  function applyOffset(value: number, length?: number) {
    const total = length ?? productsLengthRef.current;
    if (!total) {
      offsetRef.current = 0;
      x.set(0);
      return;
    }
    const loopWidth = total * CARD_WIDTH;
    if (!loopWidth) {
      offsetRef.current = 0;
      x.set(0);
      return;
    }

    let next = Number.isFinite(value) ? value : 0;
    while (next <= -loopWidth) next += loopWidth;
    while (next > 0) next -= loopWidth;

    offsetRef.current = next;
    x.set(next);
  }

  function getVisibleStart(length?: number) {
    const total = length ?? productsLengthRef.current;
    if (!total) return 0;
    const normalized = Math.abs(offsetRef.current);
    const index = Math.floor(normalized / CARD_WIDTH);
    return index % total;
  }

  const getVisibleIndices = (total: number) => {
    if (total === 0) return [];
    const visibleStart = getVisibleStart(total);
    const visibleSlots = Math.min(visibleCountRef.current, total);
    const indices: number[] = [];
    for (let i = 0; i < visibleSlots; i += 1) {
      indices.push((visibleStart + i) % total);
    }
    return indices;
  };

  const dedupeProducts = (list: RecentProduct[]) => {
    const seen = new Set<string>();
    const out: RecentProduct[] = [];
    for (const item of list) {
      const key = getProductKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
    return out;
  };

  useEffect(() => {
    const unsubscribe = x.on('change', latest => {
      const length = productsLengthRef.current;
      if (!length) {
        offsetRef.current = 0;
        return;
      }
      const loopWidth = length * CARD_WIDTH;
      if (latest <= -loopWidth || latest > 0) {
        applyOffset(latest);
      } else {
        offsetRef.current = latest;
      }
    });
    return unsubscribe;
  }, [x]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const params = new URLSearchParams({
          limit: String(MAX_PRODUCTS),
          pool: String(MAX_PRODUCTS * 6),
        });
        const response = await fetch(`/api/products/recent?${params.toString()}`, { cache: 'no-store' });
        if (!response.ok) return;

        const data = await response.json();
        const incoming = Array.isArray(data.products) ? data.products : [];
        if (!mounted) return;

        const uniqueList = dedupeProducts(incoming);
        if (uniqueList.length === 0) return;
        const shuffledList = shuffleArray(uniqueList);

        setProducts(prev => {
          if (prev.length === 0) {
            lastSwapIndexRef.current = -1;
            return shuffledList.slice(0, MAX_PRODUCTS);
          }

          const total = prev.length;
          if (total === 0) return prev;

          const currentKeys = new Set(prev.map(getProductKey));
          const candidate = shuffledList.find(item => !currentKeys.has(getProductKey(item)));
          if (!candidate) return prev;

          const visibleIndices = getVisibleIndices(total);
          if (visibleIndices.length === 0) return prev;

          const lastIndex = lastSwapIndexRef.current;
          const currentPos = visibleIndices.indexOf(lastIndex);
          const nextVisibleIndex = currentPos === -1
            ? visibleIndices[0]
            : visibleIndices[(currentPos + 1) % visibleIndices.length];

          lastSwapIndexRef.current = nextVisibleIndex;

          const next = [...prev];
          next[nextVisibleIndex] = candidate;
          return next;
        });
      } catch (error) {
        console.error('Error fetching recent products:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    let timeout: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      const delta = REFRESH_MIN_MS + Math.random() * (REFRESH_MAX_MS - REFRESH_MIN_MS);
      const ms = Math.round(delta);
      timeout = setTimeout(async () => {
        await run();
        if (mounted) scheduleNext();
      }, ms);
    };

    run().finally(() => {
      if (mounted) scheduleNext();
    });

    return () => {
      mounted = false;
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const updateVisibleCount = () => {
      const node = containerRef.current;
      if (!node) return;
      const width = node.clientWidth;
      const count = Math.max(1, Math.round(width / CARD_WIDTH));
      visibleCountRef.current = count;
    };

    updateVisibleCount();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateVisibleCount);
      const node = containerRef.current;
      if (node) observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  useEffect(() => {
    productsLengthRef.current = products.length;

    if (products.length === 0) {
      seededRef.current = false;
      applyOffset(0, 0);
      return;
    }

    if (!seededRef.current) {
      seededRef.current = true;
      const randomIndex = Math.floor(Math.random() * products.length);
      applyOffset(-randomIndex * CARD_WIDTH, products.length);
      return;
    }

    applyOffset(offsetRef.current, products.length);
  }, [products.length]);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion || productsLengthRef.current === 0) return;
    const distance = (delta / 1000) * AUTO_SCROLL_SPEED;
    applyOffset(offsetRef.current - distance);
  });

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

      <div className="relative">
        <div className="overflow-hidden px-4" ref={containerRef}>
          <motion.div
            className="flex gap-4 py-4"
            style={{ x }}
          >
            {Array.from({ length: LOOP_MULTIPLIER }).map((_, loopIdx) =>
              products.map((product, index) => (
                <motion.button
                  key={`${getProductKey(product)}-${loopIdx}-${index}`}
                  onClick={() => onProductClick(product.productId)}
                  className="flex-shrink-0 w-40 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden group focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -5 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
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

                  <div className="p-3">
                    <p className="text-xs font-medium text-gray-800 line-clamp-2 text-left">
                      {product.name}
                    </p>
                  </div>
                </motion.button>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
