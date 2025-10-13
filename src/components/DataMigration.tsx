// src/components/DataMigration.tsx
'use client';

import { useEffect, useState } from 'react';
import { migrateLocalStorageToDatabase } from '@/lib/sync';

const MIGRATION_KEY = 'pw:migrated-to-db';

export default function DataMigration() {
  const [status, setStatus] = useState<'idle' | 'migrating' | 'done' | 'error'>('idle');

  useEffect(() => {
    const checkAndMigrate = async () => {
      // Verifica se já migrou
      const alreadyMigrated = localStorage.getItem(MIGRATION_KEY);

      if (alreadyMigrated === 'true') {
        console.log('[DataMigration] Already migrated, skipping');
        setStatus('done');
        return;
      }

      console.log('[DataMigration] Starting migration...');
      // Inicia migração
      setStatus('migrating');

      const result = await migrateLocalStorageToDatabase();

      if (result.success) {
        console.log(`[DataMigration] Success! Migrated ${result.migrated} products`);
        localStorage.setItem(MIGRATION_KEY, 'true');
        setStatus('done');
      } else {
        console.error('[DataMigration] Migration failed:', result.error);
        setStatus('error');
      }
    };

    checkAndMigrate();
  }, []);

  if (status === 'idle' || status === 'done') {
    return null;
  }

  if (status === 'migrating') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-2">Migrando seus dados...</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Estamos atualizando seus favoritos para o novo sistema de sincronização.
            Isso só acontece uma vez.
          </p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white rounded-lg p-4 shadow-lg z-50">
        <h3 className="font-bold">Erro na migração</h3>
        <p className="text-sm">Houve um problema ao migrar seus dados. Tente recarregar a página.</p>
      </div>
    );
  }

  return null;
}
