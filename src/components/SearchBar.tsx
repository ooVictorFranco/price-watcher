// src/components/SearchBar.tsx
'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onMonitor: () => void;
  onClear: () => void;
  loadingMonitor?: boolean;
  placeholder?: string;
};

export default function SearchBar({
  value, onChange, onMonitor, onClear, loadingMonitor, placeholder,
}: Props) {
  const id = useId();
  const hasValue = value.trim().length > 0;

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
        <div className="flex-1">
          <label htmlFor={id} className="sr-only">
            Cole o ID, ASIN ou URL do produto
          </label>
          <input
            id={id}
            type="text"
            className="w-full rounded-xl border-2 border-gray-200 p-3 outline-none
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200
              transition-colors duration-200
              disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder={placeholder ?? 'Cole: ID KaBuM (ex.: 922662), ASIN Amazon (ex.: B0F7Z9F9SD) ou URL completa'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            disabled={loadingMonitor}
            aria-describedby={`${id}-description`}
          />
          <p id={`${id}-description`} className="sr-only">
            Cole um ID do KaBuM, ASIN da Amazon ou uma URL completa do produto que deseja monitorar
          </p>
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
