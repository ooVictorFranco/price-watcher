// src/components/LiveFileSync.tsx
'use client';

import { useEffect } from 'react';
import { initLiveFileSync } from '@/lib/livefile';

export default function LiveFileSync() {
  useEffect(() => { initLiveFileSync(); }, []);
  return null;
}
