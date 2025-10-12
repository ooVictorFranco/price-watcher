// src/lib/background.ts
'use client';

import { Snapshot } from '@/types';
import {
  getHistoryKey,
  loadFavorites,
  upsertHistory,
  saveHistory,
} from '@/lib/utils';

type Opts = { intervalMs?: number; tickMs?: number; };

const LAST_RUN_KEY = 'pw:bg:last_run';
const LEADER_KEY = 'pw:bg:leader';
const LEADER_TTL = 30_000;
const HEARTBEAT_MS = 15_000;

function now() { return Date.now(); }
function uuid4() {
  return crypto.getRandomValues(new Uint8Array(16)).reduce((s, b, i) =>
    s + (i === 4 || i === 6 || i === 8 || i === 10 ? '-' : '') +
    b.toString(16).padStart(2, '0'), '');
}

async function becomeLeader(onAcquire: () => void, onRelease: () => void) {
  const hasLocks = typeof (navigator as { locks?: { request: unknown } }).locks?.request === 'function';
  if (hasLocks) {
    try {
      await (navigator as { locks: { request: (name: string, opts: unknown, callback: () => Promise<void>) => Promise<void> } }).locks.request('pw-auto-refresh', { mode: 'exclusive' }, async () => {
        onAcquire();
        await new Promise<void>(() => {});
      });
      onRelease();
      return;
    } catch {}
  }

  const id = uuid4();
  let heartbeatTimer: NodeJS.Timeout | null = null;
  let checkTimer: NodeJS.Timeout | null = null;

  const heartbeat = () => {
    try { localStorage.setItem(LEADER_KEY, JSON.stringify({ id, ts: now() })); } catch {}
  };

  const tryAcquire = () => {
    try {
      const raw = localStorage.getItem(LEADER_KEY);
      let data: { id: string; ts: number } | null = null;
      if (raw) try { data = JSON.parse(raw); } catch { data = null; }
      const expired = !data || (now() - (data.ts ?? 0) > LEADER_TTL);
      if (expired || data?.id === id) {
        heartbeat();
        if (!heartbeatTimer) {
          heartbeatTimer = setInterval(heartbeat, HEARTBEAT_MS);
          onAcquire();
        }
      }
    } catch {}
  };

  tryAcquire();
  checkTimer = setInterval(tryAcquire, HEARTBEAT_MS);

  const onUnload = () => {
    try {
      const raw = localStorage.getItem(LEADER_KEY);
      const data = raw ? JSON.parse(raw) : null;
      if (data?.id === id) localStorage.removeItem(LEADER_KEY);
    } catch {}
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (checkTimer) clearInterval(checkTimer);
    onRelease();
  };
  window.addEventListener('beforeunload', onUnload);
}

async function refreshAllFavoritesOnce() {
  const favs = loadFavorites();
  if (!favs.length) return;

  for (const f of favs) {
    try {
      const url = new URL(window.location.origin + '/api/scrape');
      url.searchParams.set('id', f.id);
      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) continue;
      const json = await res.json();
      const snap: Snapshot = {
        timestamp: now(),
        priceVista: json.priceVista ?? null,
        priceParcelado: json.priceParcelado ?? null,
        priceOriginal: json.priceOriginal ?? null,
      };
      const key = getHistoryKey(f.id);
      const prevRaw = localStorage.getItem(key);
      const prev = prevRaw ? (JSON.parse(prevRaw) as Snapshot[]) : [];
      const next = upsertHistory(prev, snap);

      // <— salvar centralizado (emite evento pw:data-changed)
      saveHistory(f.id, next);
    } catch {}
  }

  localStorage.setItem(LAST_RUN_KEY, String(now()));
  window.dispatchEvent(new CustomEvent('pw:auto-refresh', {
    detail: { ids: favs.map(f => f.id), ranAt: now() },
  }));
}

export function startBackgroundRefresh(opts?: Opts) {
  const interval = opts?.intervalMs ?? 3 * 60 * 60 * 1000;
  const tick = opts?.tickMs ?? 60_000;

  let runnerTimer: NodeJS.Timeout | null = null;

  const runIfDue = async () => {
    try {
      const lastRaw = localStorage.getItem(LAST_RUN_KEY);
      const last = lastRaw ? Number(lastRaw) : 0;
      const due = now() - last >= interval;
      if (due) await refreshAllFavoritesOnce();
    } catch {}
  };

  const onAcquire = () => {
    runIfDue();
    runnerTimer = setInterval(runIfDue, tick);
    const onVisible = () => { if (document.visibilityState === 'visible') runIfDue(); };
    document.addEventListener('visibilitychange', onVisible);
    const onOnline = () => runIfDue();
    window.addEventListener('online', onOnline);
    (window as Window & { __pw_bg_cleanup__?: () => void }).__pw_bg_cleanup__ = () => {
      if (runnerTimer) clearInterval(runnerTimer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
    };
  };

  const onRelease = () => {
    const cleanup: (() => void) | undefined = (window as Window & { __pw_bg_cleanup__?: () => void }).__pw_bg_cleanup__;
    if (cleanup) cleanup();
  };

  becomeLeader(onAcquire, onRelease);
}
