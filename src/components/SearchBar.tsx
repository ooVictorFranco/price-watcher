// src/components/SearchBar.tsx
'use client';

import { useId } from 'react';

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
  return (
    <section className="rounded-2xl border bg-white shadow-md p-4">
      <form
        className="flex flex-col sm:flex-row items-stretch gap-3"
        onSubmit={(e) => { e.preventDefault(); onMonitor(); }}
      >
        <label htmlFor={id} className="sr-only">Buscar produto</label>
        <input
          id={id}
          className="rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          placeholder={placeholder ?? 'Cole: ID KaBuM (ex.: 922662), ASIN Amazon (ex.: B0F7Z9F9SD) ou URL completa'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-xl px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={loadingMonitor}
            title="Iniciar monitoramento"
          >
            {loadingMonitor ? 'Monitorando…' : 'Monitorar'}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl px-4 py-3 border hover:bg-gray-50"
            disabled={loadingMonitor}
            title="Limpar atual"
          >
            Limpar
          </button>
        </div>
      </form>
    </section>
  );
}
