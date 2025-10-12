// src/components/ToastHost.tsx
'use client';

import { useEffect, useState } from 'react';
import type { ToastKind, ToastPayload } from '@/lib/toast';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type ToastItem = Required<ToastPayload> & { createdAt: number };

const COLORS: Record<ToastKind, string> = {
  success: 'bg-green-600 border-green-700',
  error: 'bg-red-600 border-red-700',
  warning: 'bg-amber-500 border-amber-600',
  info: 'bg-blue-600 border-blue-700',
};

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    function onAdd(e: Event) {
      const t = (e as CustomEvent).detail as ToastItem;
      setToasts((prev) => [...prev, t]);
    }
    function onClear(e: Event) {
      const id = (e as CustomEvent).detail?.id as string | undefined;
      setToasts((prev) => (id ? prev.filter((x) => x.id !== id) : []));
    }
    window.addEventListener('toast:add', onAdd as EventListener);
    window.addEventListener('toast:clear', onClear as EventListener);
    return () => {
      window.removeEventListener('toast:add', onAdd as EventListener);
      window.removeEventListener('toast:clear', onClear as EventListener);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: prefersReduced ? 0 : -12, scale: prefersReduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: prefersReduced ? 0 : -12, scale: prefersReduced ? 1 : 0.98 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30, mass: 0.8 }}
            className={`rounded-xl border shadow-lg text-white ${COLORS[t.kind]} overflow-hidden`}
            role="status"
            aria-live="polite"
          >
            <div className="px-4 py-3 flex items-start gap-3">
              <div className="mt-0.5">
                {t.kind === 'success' && '✅'}
                {t.kind === 'error' && '⛔'}
                {t.kind === 'warning' && '⚠️'}
                {t.kind === 'info' && 'ℹ️'}
              </div>
              <div className="flex-1 min-w-0">
                {t.title && <div className="text-sm font-semibold leading-5">{t.title}</div>}
                <div className="text-sm leading-5 break-words">{t.message}</div>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="ml-2 shrink-0 rounded-md px-2 py-1 hover:bg-black/10 active:scale-95 transition"
                aria-label="Fechar"
                title="Fechar"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
