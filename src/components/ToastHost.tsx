// src/components/ToastHost.tsx
'use client';

import { useEffect, useState } from 'react';
import type { ToastKind, ToastPayload } from '@/lib/toast';

type ToastItem = Required<ToastPayload> & { createdAt: number };

const COLORS: Record<ToastKind, string> = {
  success: 'bg-green-600 border-green-700',
  error: 'bg-red-600 border-red-700',
  warning: 'bg-amber-500 border-amber-600',
  info: 'bg-blue-600 border-blue-700',
};

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onAdd(e: Event) {
      const t = (e as CustomEvent).detail as ToastItem;
      setToasts((prev) => [...prev, t]);

      const duration = (t.duration ?? 3500);
      const timer = setTimeout(() => dismiss(t.id), duration);
      // clean on unmount
      return () => clearTimeout(timer);
    }
    function onClear(e: Event) {
      const id = (e as CustomEvent).detail?.id as string | undefined;
      if (id) dismiss(id);
      else setToasts([]);
    }
    window.addEventListener('toast:add', onAdd as EventListener);
    window.addEventListener('toast:clear', onClear as EventListener);
    return () => {
      window.removeEventListener('toast:add', onAdd as EventListener);
      window.removeEventListener('toast:clear', onClear as EventListener);
    };
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
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
              onClick={() => dismiss(t.id)}
              className="ml-2 shrink-0 rounded-md px-2 py-1 hover:bg-black/10"
              aria-label="Fechar"
              title="Fechar"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
