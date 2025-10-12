// src/components/BackupMenu.tsx
'use client';

import { useEffect, useState } from 'react';
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

export default function BackupMenu() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<'export' | 'import' | 'live' | null>(null);
  const [nativeLinked, setNativeLinked] = useState<boolean>(false);
  const [compatEnabled, setCompatEnabled] = useState<boolean>(false);

  useEffect(() => {
    initLiveFileSync();
    hasLiveFile().then(setNativeLinked).catch(() => setNativeLinked(false));
    setCompatEnabled(isCompatLiveEnabled());
  }, []);

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
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao exportar o backup.');
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
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao importar o backup.');
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
        toast.success(`Arquivo “vivo” configurado: ${info.name}.`);
      }
    } catch (e: any) {
      toast.error(e?.message || 'Não foi possível configurar o arquivo vivo.');
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
    } catch {
      // noop
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
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Backup"
      >
        Backup
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 rounded-lg border bg-white shadow-lg overflow-hidden z-50">
          <div className="p-3 space-y-3 text-sm">
            <div className="font-medium">Salvar / Recuperar</div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={doExport}
                disabled={busy !== null}
                className="rounded-md border px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
              >
                {busy === 'export' ? 'Exportando…' : 'Exportar JSON'}
              </button>

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

            {/* Nativo (Chromium) */}
            {isNativeLiveSupported() ? (
              <>
                {!nativeLinked ? (
                  <div className="space-y-2">
                    <button
                      onClick={enableNative}
                      disabled={busy !== null}
                      className="w-full rounded-md border px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
                      title="Cria ou escolhe um arquivo que será atualizado automaticamente (Chrome/Edge)"
                    >
                      {busy === 'live' ? 'Configurando…' : 'Vincular arquivo (nativo)'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={disableNative}
                    className="w-full rounded-md border px-3 py-2 hover:bg-gray-50"
                  >
                    Desvincular arquivo (nativo)
                  </button>
                )}
                <p className="text-xs text-gray-500">
                  Modo nativo usa a File System Access API (Chrome/Edge) para gravar silenciosamente no arquivo.
                </p>
              </>
            ) : (
              <>
                {/* Compatível (Firefox/Safari) */}
                <div className="space-y-2">
                  <button
                    onClick={toggleCompat}
                    className="w-full rounded-md border px-3 py-2 hover:bg-gray-50"
                  >
                    {compatEnabled ? 'Desativar modo compatível' : 'Ativar modo compatível (Firefox)'}
                  </button>
                  {compatEnabled && (
                    <button
                      onClick={() => {
                        downloadCompatNow();
                        toast.success('JSON atualizado baixado.');
                      }}
                      className="w-full rounded-md border px-3 py-2 hover:bg-gray-50"
                      title="Baixar agora o JSON atualizado"
                    >
                      Salvar agora (baixar JSON)
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  No modo compatível, mostraremos um lembrete “Salvar agora” quando houver alterações.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
