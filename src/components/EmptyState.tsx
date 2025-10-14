// src/components/EmptyState.tsx
'use client';

import { motion } from 'framer-motion';

export default function EmptyState() {
  return (
    <motion.div
      className="rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg p-12 text-center relative z-0"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      role="status"
      aria-live="polite"
    >
      <motion.div
        className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-100 via-blue-100 to-emerald-100 grid place-items-center shadow-md"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <span className="text-4xl" role="img" aria-label="Buscar">🔎</span>
      </motion.div>

      <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-3">
        Pesquise ou Monitore Preços
      </h2>

      <p className="text-base text-gray-700 mb-8 max-w-md mx-auto leading-relaxed">
        Pesquise pelo nome do produto no nosso banco de dados colaborativo ou cole o ID/URL do KaBuM ou ASIN da Amazon para monitorar novos produtos e descobrir se a oferta é real!
      </p>

      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm">
        <div className="flex items-center gap-3 bg-white/60 px-4 py-3 rounded-xl border border-orange-200">
          <div className="h-3 w-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-600" aria-hidden="true"></div>
          <span className="font-medium text-gray-700">KaBuM!</span>
        </div>
        <div className="flex items-center gap-3 bg-white/60 px-4 py-3 rounded-xl border border-blue-200">
          <div className="h-3 w-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" aria-hidden="true"></div>
          <span className="font-medium text-gray-700">Amazon</span>
        </div>
      </div>
    </motion.div>
  );
}
