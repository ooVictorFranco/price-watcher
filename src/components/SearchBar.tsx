// src/components/SearchBar.tsx
'use client';

import { useId, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductAutocomplete from './ProductAutocomplete';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onMonitor: (value?: string) => void;
  onClear: () => void;
  loadingMonitor?: boolean;
  placeholder?: string;
};

export default function SearchBar({
  value, onChange, onMonitor, onClear, loadingMonitor, placeholder,
}: Props) {
  const id = useId();
  const hasValue = value.trim().length > 0;
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha autocomplete ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (productId: string, provider: 'kabum' | 'amazon') => {
    // Constrói identificador válido para parsing
    let fullIdentifier: string;
    if (provider === 'kabum') {
      fullIdentifier = /^\d+$/.test(productId)
        ? productId // Se já é um ID numérico puro, mantém
        : `https://www.kabum.com.br/produto/${productId}`;
    } else {
      fullIdentifier = /^[A-Z0-9]{10}$/i.test(productId)
        ? productId // Se já é um ASIN válido, mantém
        : `https://www.amazon.com.br/dp/${productId}`;
    }

    // Atualiza o input para mostrar o valor selecionado
    onChange(fullIdentifier);
    setShowAutocomplete(false);
    setIsFocused(false);

    // Chama onMonitor DIRETAMENTE com o valor, sem depender do estado
    onMonitor(fullIdentifier);
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowAutocomplete(newValue.trim().length >= 2);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value.trim().length >= 2) {
      setShowAutocomplete(true);
    }
  };

  const handleBlur = () => {
    // Delay para permitir click no autocomplete
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setShowAutocomplete(false);
      }
    }, 200);
  };

  return (
    <motion.section
      className="rounded-2xl border bg-white shadow-md p-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form
        className="flex flex-col sm:flex-row items-stretch gap-3"
        onSubmit={(e) => { e.preventDefault(); if (hasValue) onMonitor(); }}
        role="search"
        aria-label="Buscar produto para monitorar"
      >
        <div className="flex-1 relative" ref={containerRef}>
          <label htmlFor={id} className="sr-only">
            Busque pelo nome, ID ou cole a URL do produto
          </label>
          <input
            id={id}
            type="text"
            className={`
              w-full rounded-xl border-2 p-3 outline-none
              transition-colors duration-200
              disabled:bg-gray-50 disabled:cursor-not-allowed
              ${
                isFocused
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200'
              }
            `}
            placeholder={placeholder ?? 'Busque pelo nome, ID (922662) ou cole a URL do produto'}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            disabled={loadingMonitor}
            aria-describedby={`${id}-description`}
            aria-autocomplete="list"
            aria-controls={showAutocomplete ? `${id}-autocomplete` : undefined}
          />
          <p id={`${id}-description`} className="sr-only">
            Digite o nome do produto para buscar no cache, ou cole um ID/URL para monitorar
          </p>

          {/* Autocomplete */}
          <ProductAutocomplete
            query={value}
            onSelect={handleSelect}
            isVisible={showAutocomplete && isFocused}
          />
        </div>

        <div className="flex gap-2">
          <motion.button
            type="submit"
            className="rounded-xl px-6 py-3 bg-blue-600 text-white font-medium
              hover:bg-blue-700 active:bg-blue-800
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition-colors duration-200
              min-w-[120px]"
            disabled={loadingMonitor || !hasValue}
            aria-label={loadingMonitor ? 'Monitorando produto' : 'Iniciar monitoramento do produto'}
            whileHover={{ scale: loadingMonitor || !hasValue ? 1 : 1.02 }}
            whileTap={{ scale: loadingMonitor || !hasValue ? 1 : 0.98 }}
          >
            {loadingMonitor ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Monitorando…
              </span>
            ) : 'Monitorar'}
          </motion.button>

          <motion.button
            type="button"
            onClick={onClear}
            className="rounded-xl px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium
              hover:bg-gray-50 hover:border-gray-300
              active:bg-gray-100
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
              transition-colors duration-200"
            disabled={loadingMonitor}
            aria-label="Limpar busca e reiniciar"
            whileHover={{ scale: loadingMonitor ? 1 : 1.02 }}
            whileTap={{ scale: loadingMonitor ? 1 : 0.98 }}
          >
            Limpar
          </motion.button>
        </div>
      </form>
    </motion.section>
  );
}
