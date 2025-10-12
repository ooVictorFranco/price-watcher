// src/components/CompatLivePill.tsx
'use client';

import { useEffect, useState } from 'react';
import { downloadCompatNow } from '@/lib/livefile';

export default function CompatLivePill() {
  const [visible, setVisible] = useState(false);
  const [filename, setFilename] = useState('kabum-backup.json');

  useEffect(() => {
    const onStatus = (e: Event) => {
      const { enabled, dirty, filename } = (e as CustomEvent).detail || {};
      setFilename(filename || 'kabum-backup.json');
      setVisible(!!enabled && !!dirty);
    };
    window.addEventListener('kabum:compat-live-status', onStatus as EventListener);
    return () => window.removeEventListener('kabum:compat-live-status', onStatus as EventListener);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <div className="rounded-xl border bg-white shadow-lg p-3 flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse" aria-hidden />
        <div className="text-sm">
          <div className="font-medium">Alterações não salvas</div>
          <div className="text-xs text-gray-600">Clique para baixar o JSON atualizado ({filename}).</div>
        </div>
        <button
          onClick={downloadCompatNow}
          className="rounded-lg px-3 py-2 text-sm bg-blue-600 text-white"
        >
          Salvar agora
        </button>
      </div>
    </div>
  );
}
