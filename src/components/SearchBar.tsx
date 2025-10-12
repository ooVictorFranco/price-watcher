// src/components/SearchBar.tsx
'use client';

type Props = {
  value: string;
  loadingMonitor?: boolean;
  onChange: (v: string) => void;
  onMonitor: () => void;
  onClear: () => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  loadingMonitor,
  onChange,
  onMonitor,
  onClear,
  placeholder,
}: Props) {
  const hasText = value.trim().length > 0;

  return (
    <section className="rounded-2xl border bg-white shadow-md p-5">
      <form
        className="flex flex-col gap-3 md:flex-row"
        onSubmit={(e) => { e.preventDefault(); if (hasText && !loadingMonitor) onMonitor(); }}
      >
        <label htmlFor="prod" className="sr-only">Código ou URL do produto</label>
        <input
          id="prod"
          className="rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          placeholder={placeholder ?? 'Cole um ID ou a URL do produto (ex.: 922662)'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!hasText || !!loadingMonitor}
            className="inline-flex items-center justify-center rounded-xl px-4 py-3 font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            aria-label="Começar a monitorar"
          >
            {loadingMonitor ? 'Monitorando...' : 'Monitorar'}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center justify-center rounded-xl px-4 py-3 font-medium border hover:bg-gray-50"
            aria-label="Limpar"
          >
            Limpar
          </button>
        </div>
      </form>
      <p className="text-xs text-gray-500 mt-3">
        Digite um <strong>ID</strong> (número) ou cole a <strong>URL</strong> do produto para iniciar o monitoramento.
      </p>
    </section>
  );
}
