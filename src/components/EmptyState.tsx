// src/components/EmptyState.tsx
'use client';

export default function EmptyState() {
  return (
    <div className="rounded-2xl border bg-white shadow-md p-10 text-center">
      <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gray-100 grid place-items-center">
        <span className="text-2xl">🔎</span>
      </div>
      <h2 className="text-lg font-semibold">Monitore um produto do KaBuM!</h2>
      <p className="text-sm text-gray-600 mt-1">
        Cole o código do produto ou a URL completa, depois clique em Começar a monitorar.
      </p>
    </div>
  );
}
