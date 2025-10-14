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
      className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/40 shadow-lg p-6"
      initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      aria-busy={!!loading}
      role="region"
      aria-label="Painel de comparação"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Comparar selecionados</h3>
        <motion.span
          key={selected.length}
          className="text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 rounded-full px-3 py-1.5 shadow-sm"
          initial={{ scale: prefersReduced ? 1 : 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          aria-label={`${selected.length} ${selected.length === 1 ? 'item selecionado' : 'itens selecionados'}`}
        >
          {selected.length}
        </motion.span>
      </div>

      {loading && (
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-4" role="progressbar" aria-label="Carregando">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600 to-blue-600"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      )}

      {selected.length === 0 ? (
        <motion.div
          className="rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 border border-gray-100 p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-3xl mb-2" aria-hidden="true">📊</div>
          <p className="text-sm text-gray-700 font-medium">
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
                  className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-gradient-to-r from-violet-50/50 to-blue-50/50 backdrop-blur-sm px-3 py-1.5 text-sm shadow-sm"
                  title={nameById[id] ?? id}
                  role="listitem"
                  initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: prefersReduced ? 1 : 0.8 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                >
                  <span className="max-w-[18rem] truncate font-medium text-gray-700">{nameById[id] ?? id}</span>
                  <motion.button
                    onClick={() => onRemove(id)}
                    className="rounded-full border border-gray-200 bg-white/80 px-1.5 py-0.5 text-xs hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
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
                className="rounded-xl border border-gray-200 bg-white/50 px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
                aria-label="Selecionar métrica de comparação"
              >
                <option value="vista">À vista (PIX)</option>
                <option value="parcelado">Parcelado (total)</option>
                <option value="original">Original</option>
              </select>
            </div>

            <motion.button
              disabled={selected.length < 1 || disabled}
              onClick={onCompare}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              whileHover={{ scale: prefersReduced || selected.length < 1 || disabled ? 1 : 1.02 }}
              whileTap={{ scale: prefersReduced || selected.length < 1 || disabled ? 1 : 0.98 }}
              aria-label={loading ? (selected.length === 1 ? 'Visualizando histórico' : 'Comparando produtos') : (selected.length === 1 ? 'Ver histórico' : 'Iniciar comparação')}
            >
              {loading ? (selected.length === 1 ? 'Carregando…' : 'Comparando…') : (selected.length === 1 ? 'Ver histórico' : 'Comparar')}
            </motion.button>

            <motion.button
              disabled={selected.length === 0 || disabled}
              onClick={onRefreshSelected}
              className="rounded-xl px-5 py-2.5 text-sm font-medium border border-gray-200 bg-white/40 backdrop-blur-sm text-gray-700 hover:bg-white/60 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              whileHover={{ scale: prefersReduced || selected.length === 0 || disabled ? 1 : 1.02 }}
              whileTap={{ scale: prefersReduced || selected.length === 0 || disabled ? 1 : 0.98 }}
              aria-label={loading ? 'Atualizando produtos selecionados' : 'Atualizar preços dos produtos selecionados'}
            >
              {loading ? 'Atualizando…' : 'Atualizar selecionados'}
            </motion.button>

            <motion.button
              disabled={selected.length === 0 || disabled}
              onClick={onClear}
              className="rounded-xl px-5 py-2.5 text-sm font-medium border border-gray-200 bg-white/40 backdrop-blur-sm text-gray-700 hover:bg-white/60 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
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
                className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
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
