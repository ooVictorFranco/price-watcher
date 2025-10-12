// src/components/ComparePanel.tsx
'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

type Props = {
  selected: string[];
  nameById: Record<string, string>;
  metric: 'vista' | 'parcelado' | 'original';
  onMetric: (m: 'vista' | 'parcelado' | 'original') => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
  onRefreshSelected: () => void;
  onUnifyProducts?: () => void;
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
  onUnifyProducts,
  disabled,
  loading,
}: Props) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className="rounded-2xl border bg-white shadow-md p-5"
      initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      aria-busy={!!loading}
      role="region"
      aria-label="Painel de comparação"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Comparar selecionados</h3>
        <motion.span
          key={selected.length}
          className="text-xs font-semibold text-white bg-blue-600 rounded-full px-2.5 py-1"
          initial={{ scale: prefersReduced ? 1 : 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          aria-label={`${selected.length} ${selected.length === 1 ? 'item selecionado' : 'itens selecionados'}`}
        >
          {selected.length}
        </motion.span>
      </div>

      {loading && (
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-3" role="progressbar" aria-label="Carregando">
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      )}

      {selected.length === 0 ? (
        <motion.div
          className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-2xl mb-2" aria-hidden="true">📊</div>
          <p className="text-sm text-gray-600">
            Selecione itens nos cards de favoritos (clique no card) para montar o comparativo.
          </p>
        </motion.div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Produtos selecionados">
            <AnimatePresence mode="popLayout">
              {selected.map((id, idx) => (
                <motion.span
                  key={id}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-blue-200 bg-blue-50 px-3 py-1.5 text-sm"
                  title={nameById[id] ?? id}
                  role="listitem"
                  initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: prefersReduced ? 1 : 0.8 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                >
                  <span className="max-w-[18rem] truncate font-medium">{nameById[id] ?? id}</span>
                  <motion.button
                    onClick={() => onRemove(id)}
                    className="rounded-full border border-blue-300 bg-white px-1.5 py-0.5 text-xs hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    aria-label={`Remover ${nameById[id] ?? id} da comparação`}
                    title="Remover"
                    disabled={disabled}
                    whileHover={{ scale: prefersReduced || disabled ? 1 : 1.1 }}
                    whileTap={{ scale: prefersReduced || disabled ? 1 : 0.9 }}
                  >
                    ×
                  </motion.button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <label htmlFor="metric-select" className="font-medium text-gray-700">
                Métrica:
              </label>
              <select
                id="metric-select"
                value={metric}
                onChange={(e) => onMetric(e.target.value as 'vista' | 'parcelado' | 'original')}
                className="rounded-lg border-2 border-gray-200 px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
                aria-label="Selecionar métrica de comparação"
              >
                <option value="vista">À vista (PIX)</option>
                <option value="parcelado">Parcelado (total)</option>
                <option value="original">Original</option>
              </select>
            </div>

            <motion.button
              disabled={selected.length < 2 || disabled}
              onClick={onCompare}
              className="rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              whileHover={{ scale: prefersReduced || selected.length < 2 || disabled ? 1 : 1.02 }}
              whileTap={{ scale: prefersReduced || selected.length < 2 || disabled ? 1 : 0.98 }}
              aria-label={loading ? 'Comparando produtos' : 'Iniciar comparação'}
            >
              {loading ? 'Comparando…' : 'Comparar'}
            </motion.button>

            <motion.button
              disabled={selected.length === 0 || disabled}
              onClick={onRefreshSelected}
              className="rounded-lg px-4 py-2 text-sm font-medium border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              whileHover={{ scale: prefersReduced || selected.length === 0 || disabled ? 1 : 1.02 }}
              whileTap={{ scale: prefersReduced || selected.length === 0 || disabled ? 1 : 0.98 }}
              aria-label={loading ? 'Atualizando produtos selecionados' : 'Atualizar preços dos produtos selecionados'}
            >
              {loading ? 'Atualizando…' : 'Atualizar selecionados'}
            </motion.button>

            <motion.button
              disabled={selected.length === 0 || disabled}
              onClick={onClear}
              className="rounded-lg px-4 py-2 text-sm font-medium border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              whileHover={{ scale: prefersReduced || selected.length === 0 || disabled ? 1 : 1.02 }}
              whileTap={{ scale: prefersReduced || selected.length === 0 || disabled ? 1 : 0.98 }}
              aria-label="Limpar seleção de produtos"
            >
              Limpar seleção
            </motion.button>

            {onUnifyProducts && (
              <motion.button
                disabled={selected.length < 2 || disabled}
                onClick={onUnifyProducts}
                className="rounded-lg px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                whileHover={{ scale: prefersReduced || selected.length < 2 || disabled ? 1 : 1.02 }}
                whileTap={{ scale: prefersReduced || selected.length < 2 || disabled ? 1 : 0.98 }}
                title="Unifica os produtos selecionados como o mesmo produto em diferentes lojas"
                aria-label="Unificar produtos selecionados"
              >
                🔗 Unificar produtos
              </motion.button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
