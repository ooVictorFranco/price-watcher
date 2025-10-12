// src/components/CompatLivePill.tsx
'use client';

import { useEffect, useState } from 'react';
import { downloadCompatNow } from '@/lib/livefile';
import { toast } from '@/lib/toast';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export default function CompatLivePill() {
  const [visible, setVisible] = useState(false);
  const [filename, setFilename] = useState('price-watcher-backup.json');
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const onStatus = (e: Event) => {
      const { enabled, dirty, filename } = (e as CustomEvent).detail || {};
      setFilename(filename || 'price-watcher-backup.json');
      setVisible(!!enabled && !!dirty);
    };
    window.addEventListener('pw:compat-live-status', onStatus as EventListener);
    return () => window.removeEventListener('pw:compat-live-status', onStatus as EventListener);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed right-4 bottom-4 z-50"
          initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        >
          <div className="rounded-xl border bg-white shadow-lg p-3 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse" aria-hidden />
            <div className="text-sm">
              <div className="font-medium">Alterações não salvas</div>
              <div className="text-xs text-gray-600">Clique para baixar o JSON atualizado ({filename}).</div>
            </div>
            <motion.button
              whileHover={{ scale: prefersReduced ? 1 : 1.04 }}
              whileTap={{ scale: prefersReduced ? 1 : 0.97 }}
              onClick={() => { downloadCompatNow(); toast.success('JSON atualizado baixado.'); }}
              className="rounded-lg px-3 py-2 text-sm bg-blue-600 text-white"
            >
              Salvar agora
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
