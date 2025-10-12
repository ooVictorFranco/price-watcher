// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import BackgroundRefresher from '@/components/BackgroundRefresher';
import BackupMenu from '@/components/BackupMenu';
import LiveFileSync from '@/components/LiveFileSync';
import CompatLivePill from '@/components/CompatLivePill';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Monitor de preço',
  description: 'Monitoramento, favoritos e comparativo de preços no KaBuM!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900`}>
        {/* Inicializadores em segundo plano */}
        <BackgroundRefresher />
        <LiveFileSync />
        {/* Aviso/pílula para modo compatível (Firefox/Safari) */}
        <CompatLivePill />

        <header className="bg-white border-b">
          <nav className="mx-auto max-w-6xl px-6 h-14 flex items-center gap-3">
            <Link href="/" className="font-semibold">Monitor de preço</Link>

            <div className="ml-auto flex items-center gap-1 text-sm">
              <Link href="/" className="px-3 py-1 rounded-lg hover:bg-gray-100">Monitorar</Link>
              <Link href="/favoritos" className="px-3 py-1 rounded-lg hover:bg-gray-100">Favoritos & Comparar</Link>
              <BackupMenu />
            </div>
          </nav>
        </header>

        {children}

        <footer className="mt-10 border-t bg-white">
          <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-gray-500 space-y-1">
            <p>
              <strong>Aviso:</strong> este site realiza uma consulta automática a cada <strong>3 horas</strong>{' '}
              para todos os produtos salvos em <Link href="/favoritos" className="underline">Favoritos</Link>,{' '}
              enquanto ao menos uma aba desta aplicação estiver aberta (mesmo em segundo plano).
            </p>
            <p>
              Os dados (favoritos e histórico de preços) são armazenados <strong>no seu navegador</strong>.
              Ao limpar histórico/cache do navegador, você pode perder essas informações.
              Use <strong>Backup → Exportar JSON</strong> ou ative o <strong>Arquivo vivo</strong>.
            </p>
            <p>
              <strong>Retenção do histórico:</strong> o histórico exibido e o arquivo vivo mantêm apenas os últimos <strong>90 dias</strong> de dados para manter o arquivo leve.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
