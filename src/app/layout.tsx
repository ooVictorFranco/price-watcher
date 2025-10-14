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
  title: 'Price Watcher - Monitor de Preços com Histórico Ilimitado 2025',
  description: 'Monitore preços com histórico ilimitado, atualização automática e cache compartilhado. Sistema colaborativo para decisões informadas de compra.',
  keywords: 'monitor de preços, comparar preços, histórico de preços, ofertas, promoções, black friday, cyber monday, acompanhamento de preços, cache compartilhado',
  authors: [{ name: 'Victor Franco', url: 'https://github.com/ooVictorFranco' }],
  creator: 'Victor Franco',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Price Watcher - Monitor de Preços',
    description: 'Histórico ilimitado, atualização automática e cache compartilhado. Decisões informadas de compra.',
    siteName: 'Price Watcher',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Price Watcher - Monitor de Preços',
    description: 'Histórico ilimitado + cache compartilhado. Sistema colaborativo para compras informadas.',
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
            <Link href="/" className="font-semibold text-lg transition-transform hover:scale-[1.02]">
              Price Watcher
            </Link>

            {/* Desktop Navigation */}
            <div className="ml-auto hidden md:flex items-center gap-1 text-sm">
              <Link href="/" className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Monitorar
              </Link>
              <Link href="/favoritos" className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Favoritos
              </Link>
              <Link href="/changelog" className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Novidades
              </Link>
              <BackupMenu />
            </div>

            {/* Mobile Navigation */}
            <div className="ml-auto flex md:hidden items-center gap-1 text-sm">
              <Link href="/" className="px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors" title="Monitorar">
                🔍
              </Link>
              <Link href="/favoritos" className="px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors" title="Favoritos">
                ⭐
              </Link>
              <Link href="/changelog" className="px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors" title="Novidades">
                📝
              </Link>
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
