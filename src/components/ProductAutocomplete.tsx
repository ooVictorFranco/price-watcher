// src/components/ProductAutocomplete.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

type SearchResult = {
  productId: string;
  provider: 'kabum' | 'amazon';
  name: string;
  image: string | null;
  lastCheckedAt: Date | null;
};

type Props = {
  query: string;
  onSelect: (productId: string, provider: 'kabum' | 'amazon') => void;
  isVisible: boolean;
};

export default function ProductAutocomplete({ query, onSelect, isVisible }: Props) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2 || !isVisible) {
        setResults([]);
        return;
      }

      // Cancela requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Cria novo AbortController
      abortControllerRef.current = new AbortController();

      setLoading(true);
      try {
        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(query)}`,
          { signal: abortControllerRef.current.signal }
        );

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        setResults(data.results || []);
        setSelectedIndex(-1);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Requisição cancelada, ignorar
          return;
        }
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce de 300ms
    const timeoutId = setTimeout(searchProducts, 300);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, isVisible]);

  // Limpa resultados quando não está visível
  useEffect(() => {
    if (!isVisible) {
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isVisible]);

  const handleSelect = (productId: string, provider: 'kabum' | 'amazon') => {
    onSelect(productId, provider);
    setResults([]);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="bg-yellow-200 text-gray-900">{part}</mark>
        : part
    );
  };

  if (!isVisible || results.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white border border-violet-200 rounded-xl shadow-xl overflow-hidden z-[1000]"
      >
        {loading && (
          <div className="px-4 py-3 text-sm text-gray-500">
            Buscando produtos...
          </div>
        )}

        {!loading && results.length > 0 && (
          <ul className="max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <li key={`${result.provider}:${result.productId}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(result.productId, result.provider)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full px-4 py-3 flex items-center gap-3 text-left
                    transition-colors duration-150
                    ${
                      index === selectedIndex
                        ? 'bg-violet-50'
                        : 'hover:bg-gray-50'
                    }
                    ${index !== results.length - 1 ? 'border-b border-gray-100' : ''}
                  `}
                >
                  {/* Imagem do produto */}
                  {result.image ? (
                    <div className="w-12 h-12 relative flex-shrink-0">
                      <Image
                        src={result.image}
                        alt={result.name}
                        fill
                        className="object-contain rounded bg-gray-50"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Informações do produto */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {highlightMatch(result.name, query)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {result.provider === 'kabum' ? 'KaBuM!' : 'Amazon'}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 font-mono">
                        {highlightMatch(result.productId, query)}
                      </span>
                    </div>
                  </div>

                  {/* Ícone de seta */}
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0"
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
              </li>
            ))}
          </ul>
        )}

        {!loading && results.length === 0 && query.length >= 2 && (
          <div className="px-4 py-3 text-sm text-gray-500">
            Nenhum produto encontrado no cache.
            <br />
            <span className="text-xs text-gray-400">
              Cole o ID ou URL do produto para monitorar.
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
