// src/components/SkeletonCards.tsx
'use client';

import { motion } from 'framer-motion';

export default function SkeletonCards() {
  return (
    <motion.div
      className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/40 shadow-lg p-6 space-y-5 relative z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-live="polite"
      aria-label="Carregando informações do produto"
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
        <div className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full" />
      </div>

      {/* Price cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-xl bg-gray-50 p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded mb-3" />
            <div className="h-10 w-36 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
          </motion.div>
        ))}
      </div>

      {/* Chart skeleton */}
      <motion.div
        className="h-64 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      />

      <span className="sr-only">Carregando dados do produto...</span>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </motion.div>
  );
}
