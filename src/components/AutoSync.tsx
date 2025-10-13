// src/components/AutoSync.tsx
'use client';

import { useEffect } from 'react';
import { startAutoSync } from '@/lib/db-sync';

/**
 * Componente que gerencia sincronização automática entre localStorage e banco de dados
 */
export default function AutoSync() {
  useEffect(() => {
    console.log('[AutoSync] Iniciando sincronização automática...');

    // Inicia sincronização automática
    const cleanup = startAutoSync();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return null;
}
