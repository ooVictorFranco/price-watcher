// src/app/debug/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { loadFavorites } from '@/lib/utils';
import { getSessionId, getAuthHeaders } from '@/lib/session';

interface DbProduct {
  id: string;
  productId: string;
  provider: string;
  name: string;
  image: string | null;
  groupId: string | null;
  addedAt: string;
}

export default function DebugPage() {
  const [sessionId, setSessionId] = useState('');
  const [localFavorites, setLocalFavorites] = useState<unknown[]>([]);
  const [dbFavorites, setDbFavorites] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState('');

  useEffect(() => {
    const init = async () => {
      // Get session ID
      const sid = getSessionId();
      setSessionId(sid);

      // Get localStorage favorites
      const local = loadFavorites();
      setLocalFavorites(local);

      // Get database favorites
      try {
        const response = await fetch('/api/favorites', {
          method: 'GET',
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          setDbFavorites(data.products || []);
        }
      } catch (error) {
        console.error('Error fetching from DB:', error);
      }

      // Check migration status
      const migrated = localStorage.getItem('pw:migrated-to-db');
      setMigrationStatus(migrated || 'not_migrated');

      setLoading(false);
    };

    init();
  }, []);

  const forceMigration = async () => {
    localStorage.removeItem('pw:migrated-to-db');
    window.location.reload();
  };

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug - Loading...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Debug - Sync Status</h1>

        <div className="bg-white rounded-lg border p-4 space-y-2">
          <h2 className="font-bold text-lg">Session Info</h2>
          <p>
            <strong>Session ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{sessionId}</code>
          </p>
          <p>
            <strong>Migration Status:</strong>{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">{migrationStatus}</code>
          </p>
          <button
            onClick={forceMigration}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Force Re-Migration
          </button>
        </div>

        <div className="bg-white rounded-lg border p-4 space-y-2">
          <h2 className="font-bold text-lg">localStorage Favorites ({localFavorites.length})</h2>
          <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
            {JSON.stringify(localFavorites, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg border p-4 space-y-2">
          <h2 className="font-bold text-lg">Database Favorites ({dbFavorites.length})</h2>
          <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
            {JSON.stringify(dbFavorites, null, 2)}
          </pre>
        </div>

        {localFavorites.length > 0 && dbFavorites.length === 0 && (
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4">
            <h3 className="font-bold text-yellow-800">⚠️ Sync Issue Detected</h3>
            <p className="text-yellow-800">
              You have {localFavorites.length} favorites in localStorage but none in the database. The migration may have
              failed.
            </p>
          </div>
        )}

        {dbFavorites.length > 0 && localFavorites.length === 0 && (
          <div className="bg-green-100 border border-green-400 rounded-lg p-4">
            <h3 className="font-bold text-green-800">✓ Database Active</h3>
            <p className="text-green-800">You have {dbFavorites.length} favorites in the database.</p>
          </div>
        )}
      </div>
    </main>
  );
}
