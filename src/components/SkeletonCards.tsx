// src/components/SkeletonCards.tsx
'use client';

export default function SkeletonCards() {
  return (
    <div className="animate-pulse rounded-2xl border bg-white shadow-md p-5 space-y-5">
      <div className="h-6 w-40 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-8 w-32 bg-gray-200 rounded" />
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
          <div className="h-8 w-32 bg-gray-200 rounded" />
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-8 w-32 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-56 bg-gray-100 rounded-xl" />
    </div>
  );
}
