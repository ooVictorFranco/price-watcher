// src/lib/toast.ts
'use client';

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export type ToastPayload = {
  id?: string;
  kind: ToastKind;
  title?: string;
  message: string;
  duration?: number; // ms
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function emit(payload: ToastPayload) {
  const detail = { ...payload, id: payload.id ?? uid(), createdAt: Date.now() };
  window.dispatchEvent(new CustomEvent('toast:add', { detail }));
  return detail.id as string;
}

export const toast = {
  show: emit,
  success: (message: string, opts: Partial<ToastPayload> = {}) =>
    emit({ kind: 'success', message, duration: 3500, ...opts }),
  error: (message: string, opts: Partial<ToastPayload> = {}) =>
    emit({ kind: 'error', message, duration: 5000, ...opts }),
  warning: (message: string, opts: Partial<ToastPayload> = {}) =>
    emit({ kind: 'warning', message, duration: 4500, ...opts }),
  info: (message: string, opts: Partial<ToastPayload> = {}) =>
    emit({ kind: 'info', message, duration: 3500, ...opts }),
  clear: (id?: string) => {
    window.dispatchEvent(new CustomEvent('toast:clear', { detail: { id } }));
  },
};
