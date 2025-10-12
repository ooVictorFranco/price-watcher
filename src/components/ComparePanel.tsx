// src/components/ComparePanel.tsx
'use client';

type Props = {
  selected: string[];
  nameById: Record<string, string>;
  metric: 'vista' | 'parcelado' | 'original';
  onMetric: (m: 'vista' | 'parcelado' | 'original') => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
  onRefreshSelected: () => void;
  disabled?: boolean;
  /** Mostra shimmer/barra de progresso no topo do painel */
  loading?: boolean;
};

export default function ComparePanel({
  selected,
  nameById,
  metric,
  onMetric,
  onRemove,
  onClear,
  onCompare,
  onRefreshSelected,
  disabled,
  loading,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white shadow-md p-5" aria-busy={!!loading}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Comparar selecionados</h3>
        <span className="text-xs text-gray-500">{selected.length} item(ns)</span>
      </div>

      {loading && <div className="skeleton-bar mb-3" />}

      {selected.length === 0 ? (
        <p className="text-sm text-gray-600">
          Selecione itens nos cards de favoritos (clique no card) para montar o comparativo.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {selected.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                title={nameById[id] ?? id}
              >
                <span className="max-w-[18rem] truncate">{nameById[id] ?? id}</span>
                <button
                  onClick={() => onRemove(id)}
                  className="rounded-full border px-2 py-0.5 text-xs hover:bg-gray-50"
                  aria-label="Remover da comparação"
                  title="Remover"
                  disabled={disabled}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span>métrica:</span>
              <select
                value={metric}
                onChange={(e) => onMetric(e.target.value as 'vista' | 'parcelado' | 'original')}
                className="rounded-lg border px-2 py-1 text-sm"
                disabled={disabled}
              >
                <option value="vista">À vista (PIX)</option>
                <option value="parcelado">Parcelado (total)</option>
                <option value="original">Original</option>
              </select>
            </div>

            <button
              disabled={selected.length < 2 || disabled}
              onClick={onCompare}
              className="rounded-lg px-3 py-2 text-sm bg-blue-600 text-white disabled:opacity-50"
            >
              {loading ? 'Comparando…' : 'Comparar'}
            </button>

            <button
              disabled={selected.length === 0 || disabled}
              onClick={onRefreshSelected}
              className="rounded-lg px-3 py-2 text-sm border hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Atualizando…' : 'Atualizar selecionados'}
            </button>

            <button
              disabled={selected.length === 0 || disabled}
              onClick={onClear}
              className="rounded-lg px-3 py-2 text-sm border hover:bg-gray-50 disabled:opacity-50"
            >
              Limpar seleção
            </button>
          </div>
        </>
      )}
    </div>
  );
}
