// src/components/BackgroundRefresher.tsx
'use client';

import { useEffect } from 'react';
import { startBackgroundRefresh } from '@/lib/background';

/**
 * Componente “invisível” que inicializa o auto-refresh em segundo plano.
 * É montado no layout e roda uma única vez por aba.
 */
export default function BackgroundRefresher() {
  useEffect(() => {
    startBackgroundRefresh({ intervalMs: 3 * 60 * 60 * 1000 }); // 3h
  }, []);
  return null;
}
