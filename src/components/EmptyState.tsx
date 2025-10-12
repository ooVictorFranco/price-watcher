// src/components/EmptyState.tsx
'use client';

import { motion } from 'framer-motion';

export default function EmptyState() {
  return (
    <motion.div
      className="rounded-2xl border bg-white shadow-md p-10 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      role="status"
      aria-live="polite"
    >
      <motion.div
        className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 grid place-items-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <span className="text-3xl" role="img" aria-label="Buscar">🔎</span>
      </motion.div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Monitore produtos online
      </h2>

      <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
        Cole o ID do KaBuM, ASIN da Amazon ou URL completa do produto que deseja monitorar e acompanhe a variação de preços.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true"></div>
          <span>Suporta KaBuM</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-orange-500" aria-hidden="true"></div>
          <span>Suporta Amazon</span>
        </div>
      </div>
    </motion.div>
  );
}
