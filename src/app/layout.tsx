// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import BackgroundRefresher from '@/components/BackgroundRefresher';
import BackupMenu from '@/components/BackupMenu';
import LiveFileSync from '@/components/LiveFileSync';
import CompatLivePill from '@/components/CompatLivePill';
import ToastHost from '@/components/ToastHost';
import RouteTransitions from '@/components/RouteTransitions';
import Footer from '@/components/Footer';
import DataMigration from '@/components/DataMigration';
import AutoSync from '@/components/AutoSync';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Price Watcher - Monitor de Preços Black Friday 2025 | KaBuM! e Amazon',
  description: 'Descubra se as lojas realmente baixaram os preços na Black Friday! Monitore preços da KaBuM! e Amazon automaticamente. Compare históricos e evite falsos descontos em promoções sazonais.',
  keywords: 'monitor de preços, black friday, cyber monday, promoções, kabum, amazon, comparar preços, histórico de preços, descontos reais',
  authors: [{ name: 'Victor Franco', url: 'https://github.com/ooVictorFranco' }],
  creator: 'Victor Franco',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Price Watcher - Monitor de Preços Black Friday 2025',
    description: 'Descubra se as lojas realmente baixaram os preços na Black Friday! Monitore preços automaticamente e evite falsos descontos.',
    siteName: 'Price Watcher',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Price Watcher - Monitor de Preços Black Friday 2025',
    description: 'Descubra se as lojas realmente baixaram os preços na Black Friday! Monitore preços automaticamente.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900`}>
        {/* Hosts/Inicializadores */}
        <ToastHost />
        <DataMigration />
        <AutoSync />
        <BackgroundRefresher />
        <LiveFileSync />
        <CompatLivePill />

        <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-[200]">
          <nav className="mx-auto max-w-6xl px-6 h-14 flex items-center gap-3">
            <Link href="/" className="font-semibold transition-transform hover:scale-[1.02]">
              Price Watcher
            </Link>

            <div className="ml-auto flex items-center gap-1 text-sm">
              <Link href="/" className="px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors">Monitorar</Link>
              <Link href="/favoritos" className="px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors">Favoritos & Comparar</Link>
              <BackupMenu />
            </div>
          </nav>
        </header>

        {/* Transições entre páginas */}
        <RouteTransitions>{children}</RouteTransitions>

        {/* Footer atualizado */}
        <Footer />
      </body>
    </html>
  );
}
