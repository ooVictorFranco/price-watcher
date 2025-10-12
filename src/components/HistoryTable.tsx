// src/components/HistoryTable.tsx
'use client';

import { Snapshot } from '@/types';
import { brl } from '@/lib/utils';
import dayjs from 'dayjs';
import { motion, useReducedMotion } from 'framer-motion';

type Props = {
  history: Snapshot[];
};

export default function HistoryTable({ history }: Props) {
  const prefersReduced = useReducedMotion();
  const sortedHistory = history.slice().reverse();

  return (
    <motion.div
      className="rounded-2xl border bg-white shadow-md p-5"
      initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      role="region"
      aria-label="Histórico de preços"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Histórico de Preços</h3>
        <span className="text-xs text-gray-500" aria-label={`${sortedHistory.length} registros no histórico`}>
          {sortedHistory.length} {sortedHistory.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm" role="table" aria-label="Tabela de histórico de preços">
          <thead className="sticky top-0 bg-white shadow-sm">
            <tr className="text-left border-b-2 border-gray-200">
              <th className="py-3 pr-4 font-semibold text-gray-700" scope="col">Data</th>
              <th className="py-3 pr-4 font-semibold text-gray-700" scope="col">À vista</th>
              <th className="py-3 pr-4 font-semibold text-gray-700" scope="col">Parcelado</th>
              <th className="py-3 pr-4 font-semibold text-gray-700" scope="col">Original</th>
            </tr>
          </thead>
          <tbody>
            {sortedHistory.map((row, idx) => {
              const prevRow = sortedHistory[idx - 1];
              const vistaDown = prevRow && row.priceVista && prevRow.priceVista && row.priceVista < prevRow.priceVista;
              const vistaUp = prevRow && row.priceVista && prevRow.priceVista && row.priceVista > prevRow.priceVista;

              return (
                <motion.tr
                  key={row.timestamp}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: prefersReduced ? 0 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                >
                  <td className="py-3 pr-4 text-gray-600">
                    <time dateTime={new Date(row.timestamp).toISOString()}>
                      {dayjs(row.timestamp).format('DD/MM/YYYY HH:mm')}
                    </time>
                  </td>
                  <td className="py-3 pr-4 font-medium">
                    <span className={vistaDown ? 'text-green-600' : vistaUp ? 'text-red-600' : 'text-gray-900'}>
                      {brl(row.priceVista)}
                      {vistaDown && <span className="ml-1 text-xs" aria-label="Preço caiu">▼</span>}
                      {vistaUp && <span className="ml-1 text-xs" aria-label="Preço subiu">▲</span>}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-900">{brl(row.priceParcelado)}</td>
                  <td className="py-3 pr-4 text-gray-400 line-through">{brl(row.priceOriginal)}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedHistory.length === 0 && (
        <motion.div
          className="text-center py-8 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-3xl mb-2" aria-hidden="true">📋</div>
          <p className="text-sm">Nenhum registro de histórico disponível ainda.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
