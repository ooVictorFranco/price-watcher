// src/lib/livefile.ts
'use client';

import { idbGet, idbSet, idbDel } from './idb';
import { exportLocalData } from './backup';

const STORE = 'fs-handles';
const HANDLE_KEY = 'livefile-handle';

const COMPAT_ENABLED = 'kabum:compat_live_enabled';
const COMPAT_DIRTY = 'kabum:compat_live_dirty';
const COMPAT_NAME = 'kabum:compat_live_name';

type FileHandle = FileSystemFileHandle | any;

function supportsNative() {
  return typeof window !== 'undefined' && ('showSaveFilePicker' in window || 'showOpenFilePicker' in window);
}

export function isNativeLiveSupported(): boolean {
  return supportsNative();
}

async function getHandle(): Promise<FileHandle | null> {
  if (!supportsNative()) return null;
  const h = await idbGet<FileHandle>(STORE, HANDLE_KEY);
  return h ?? null;
}

async function setHandle(h: FileHandle) {
  await idbSet(STORE, HANDLE_KEY, h);
}

export async function clearHandle() {
  await idbDel(STORE, HANDLE_KEY);
}

async function hasWritePermission(h: FileHandle) {
  // @ts-ignore
  const q = await h.queryPermission?.({ mode: 'readwrite' }) ?? 'granted';
  if (q === 'granted') return true;
  // @ts-ignore
  const r = await h.requestPermission?.({ mode: 'readwrite' }) ?? 'denied';
  return r === 'granted';
}

async function writeFullSnapshot(h: FileHandle) {
  const data = exportLocalData();
  const stream = await h.createWritable();
  await stream.write(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  await stream.close();
}

/** Cria novo arquivo e mantém sincronizado (nativo – Chrome/Edge). */
export async function pickLiveFile(): Promise<{ name: string } | null> {
  if (!supportsNative()) throw new Error('Recurso nativo disponível apenas em navegadores Chromium.');
  // @ts-ignore
  const handle: FileHandle = await (window as any).showSaveFilePicker({
    suggestedName: 'kabum-backup.json',
    types: [{ description: 'Backup JSON', accept: { 'application/json': ['.json'] } }],
  });
  const ok = await hasWritePermission(handle);
  if (!ok) throw new Error('Permissão negada para escrever no arquivo.');
  await setHandle(handle);
  await writeFullSnapshot(handle);
  // desativa modo compatível se estava ativo
  localStorage.removeItem(COMPAT_ENABLED);
  return { name: (handle as any).name || 'kabum-backup.json' };
}

/** Vincula arquivo EXISTENTE como “vivo” (nativo – Chrome/Edge). */
export async function pickExistingLiveFile(): Promise<{ name: string } | null> {
  if (!supportsNative()) throw new Error('Recurso nativo indisponível neste navegador.');
  // @ts-ignore
  const handles: FileHandle[] = await (window as any).showOpenFilePicker({
    multiple: false,
    types: [{ description: 'Backup JSON', accept: { 'application/json': ['.json'] } }],
  });
  const handle = handles?.[0];
  if (!handle) return null;

  const ok = await hasWritePermission(handle);
  if (!ok) throw new Error('Permissão negada para escrever no arquivo.');
  await setHandle(handle);
  await writeFullSnapshot(handle);
  localStorage.removeItem(COMPAT_ENABLED);
  return { name: (handle as any).name || 'kabum-backup.json' };
}

/** Existe um arquivo vivo nativo vinculado? */
export async function hasLiveFile(): Promise<boolean> {
  return !!(await getHandle());
}

/** Força escrita imediata no arquivo vivo nativo. */
export async function flushLiveFile() {
  const h = await getHandle();
  if (!h) return;
  const ok = await hasWritePermission(h);
  if (!ok) return;
  try {
    await writeFullSnapshot(h);
  } catch {
    // ignorar
  }
}

/* ========= MODO COMPATÍVEL (Firefox/Safari) ========= */

export function enableCompatLive(filename?: string) {
  localStorage.setItem(COMPAT_ENABLED, '1');
  if (filename) localStorage.setItem(COMPAT_NAME, filename);
  localStorage.removeItem(COMPAT_DIRTY);
  dispatchCompatStatus();
}

export function disableCompatLive() {
  localStorage.removeItem(COMPAT_ENABLED);
  localStorage.removeItem(COMPAT_DIRTY);
  dispatchCompatStatus();
}

export function isCompatLiveEnabled(): boolean {
  return localStorage.getItem(COMPAT_ENABLED) === '1';
}

function setCompatDirty(v: boolean) {
  if (v) localStorage.setItem(COMPAT_DIRTY, '1');
  else localStorage.removeItem(COMPAT_DIRTY);
  dispatchCompatStatus();
}

export function isCompatDirty(): boolean {
  return localStorage.getItem(COMPAT_DIRTY) === '1';
}

function dispatchCompatStatus() {
  try {
    window.dispatchEvent(new CustomEvent('kabum:compat-live-status', {
      detail: {
        enabled: isCompatLiveEnabled(),
        dirty: isCompatDirty(),
        filename: localStorage.getItem(COMPAT_NAME) || 'kabum-backup.json',
      },
    }));
  } catch { }
}

/** Gera download do JSON atual (Firefox/Safari). */
export function downloadCompatNow() {
  const data = exportLocalData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = localStorage.getItem(COMPAT_NAME) || 'kabum-backup.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setCompatDirty(false);
}

/** Inicializa listeners: grava (nativo) ou marca “sujo” (compat). */
export function initLiveFileSync() {
  const onChange = () => {
    hasLiveFile().then((hasNative) => {
      if (hasNative) {
        flushLiveFile();
      } else if (isCompatLiveEnabled()) {
        setCompatDirty(true);
      }
    });
  };

  window.addEventListener('kabum:data-changed', onChange as EventListener);
  window.addEventListener('kabum:auto-refresh', onChange as EventListener);

  const onVisible = () => { if (document.visibilityState === 'visible') onChange(); };
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('online', onChange);

  dispatchCompatStatus();
  window.addEventListener('beforeunload', () => { flushLiveFile(); });
}
