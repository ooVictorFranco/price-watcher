// src/components/BackupMenu.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { BackupBlob, exportLocalData, importDataMerge } from '@/lib/backup';
import {
  clearHandle,
  initLiveFileSync,
  pickLiveFile,
  flushLiveFile,
  pickExistingLiveFile,
  hasLiveFile,
  isNativeLiveSupported,
  enableCompatLive,
  disableCompatLive,
  isCompatLiveEnabled,
  downloadCompatNow,
} from '@/lib/livefile';
import { toast } from '@/lib/toast';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export default function BackupMenu() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<'export' | 'import' | 'live' | null>(null);
  const [nativeLinked, setNativeLinked] = useState<boolean>(false);
  const [compatEnabled, setCompatEnabled] = useState<boolean>(false);
  const prefersReduced = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initLiveFileSync();
    hasLiveFile().then(setNativeLinked).catch(() => setNativeLinked(false));
    setCompatEnabled(isCompatLiveEnabled());
  }, []);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    // Pequeno delay para evitar fechar imediatamente após abrir
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  async function doExport() {
    setBusy('export');
    try {
      const data = exportLocalData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `kabum-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Backup exportado (.json).');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Falha ao exportar o backup.';
      toast.error(message);
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }

  async function doImport(file: File) {
    setBusy('import');
    try {
      const text = await file.text();
      const json = JSON.parse(text) as BackupBlob;
      const res = importDataMerge(json);
      toast.success(`Importado/mesclado: ${res.favorites} favoritos, ${res.histories} pontos no histórico.`);

      if (isNativeLiveSupported()) {
        const wantsNative = confirm(
          'Deseja vincular ESTE MESMO arquivo como “arquivo vivo”? ' +
          'No seletor a seguir, escolha o MESMO arquivo (Chrome/Edge).'
        );
        if (wantsNative) {
          const info = await pickExistingLiveFile();
          if (info) {
            setNativeLinked(true);
            setCompatEnabled(false);
            await flushLiveFile();
            toast.success(`Arquivo “vivo” vinculado: ${info.name}.`);
          }
        }
      } else {
        const wantsCompat = confirm(
          'Você está no Firefox/Safari. Ativar modo compatível de “arquivo vivo”? ' +
          'Mostraremos um lembrete “Salvar agora” quando houver alterações.'
        );
        if (wantsCompat) {
          enableCompatLive(file.name || 'kabum-backup.json');
          setCompatEnabled(true);
          toast.info('Modo compatível ativado. Use “Salvar agora” quando aparecer o lembrete.');
        }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Falha ao importar o backup.';
      toast.error(message);
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }

  async function enableNative() {
    setBusy('live');
    try {
      const info = await pickLiveFile();
      if (info) {
        setNativeLinked(true);
        setCompatEnabled(false);
        await flushLiveFile();
        toast.success(`Arquivo "vivo" configurado: ${info.name}.`);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Não foi possível configurar o arquivo vivo.';
      toast.error(message);
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }

  async function disableNative() {
    try {
      await clearHandle();
      setNativeLinked(false);
      toast.info('Arquivo “vivo” nativo desvinculado.');
    } finally {
      setOpen(false);
    }
  }

  function toggleCompat() {
    if (compatEnabled) {
      disableCompatLive();
      setCompatEnabled(false);
      toast.info('Modo compatível desativado.');
    } else {
      enableCompatLive('kabum-backup.json');
      setCompatEnabled(true);
      toast.info('Modo compatível ativado. Usaremos “Salvar agora” quando houver alterações.');
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: prefersReduced ? 1 : 1.03 }}
        whileTap={{ scale: prefersReduced ? 1 : 0.97 }}
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Backup"
      >
        Backup
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: prefersReduced ? 1 : 0.98, y: -4 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className="absolute right-0 mt-2 w-96 rounded-lg border bg-white shadow-lg overflow-hidden z-[300]"
          >
            <div className="p-3 space-y-3 text-sm">
              <div className="font-medium">Salvar / Recuperar</div>

              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
                  whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
                  onClick={doExport}
                  disabled={busy !== null}
                  className="rounded-md border px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
                >
                  {busy === 'export' ? 'Exportando…' : 'Exportar JSON'}
                </motion.button>

                <label className="rounded-md border px-3 py-2 hover:bg-gray-50 text-center cursor-pointer disabled:opacity-50">
                  {busy === 'import' ? 'Importando…' : 'Importar JSON'}
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) doImport(f);
                    }}
                  />
                </label>
              </div>

              <div className="pt-2 border-t" />

              <div className="font-medium">Arquivo “vivo”</div>

              {isNativeLiveSupported() ? (
                <>
                  {!nativeLinked ? (
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
                        whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
                        onClick={enableNative}
                        disabled={busy !== null}
                        className="w-full rounded-md border px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
                        title="Cria ou escolhe um arquivo que será atualizado automaticamente (Chrome/Edge)"
                      >
                        {busy === 'live' ? 'Configurando…' : 'Vincular arquivo (nativo)'}
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
                      whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
                      onClick={disableNative}
                      className="w-full rounded-md border px-3 py-2 hover:bg-gray-50"
                    >
                      Desvincular arquivo (nativo)
                    </motion.button>
                  )}
                  <p className="text-xs text-gray-500">
                    Modo nativo usa a File System Access API (Chrome/Edge) para gravar silenciosamente no arquivo.
                  </p>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
                      whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
                      onClick={toggleCompat}
                      className="w-full rounded-md border px-3 py-2 hover:bg-gray-50"
                    >
                      {compatEnabled ? 'Desativar modo compatível' : 'Ativar modo compatível (Firefox)'}
                    </motion.button>
                    {compatEnabled && (
                      <motion.button
                        whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
                        whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
                        onClick={() => { downloadCompatNow(); toast.success('JSON atualizado baixado.'); }}
                        className="w-full rounded-md border px-3 py-2 hover:bg-gray-50"
                        title="Baixar agora o JSON atualizado"
                      >
                        Salvar agora (baixar JSON)
                      </motion.button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    No modo compatível, mostraremos um lembrete “Salvar agora” quando houver alterações.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
