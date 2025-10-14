// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import BackgroundRefresher from '@/components/BackgroundRefresher';
import LiveFileSync from '@/components/LiveFileSync';
import CompatLivePill from '@/components/CompatLivePill';
import ToastHost from '@/components/ToastHost';
import RouteTransitions from '@/components/RouteTransitions';
import Footer from '@/components/Footer';
import DataMigration from '@/components/DataMigration';
import AutoSync from '@/components/AutoSync';
import MobileMenu from '@/components/MobileMenu';
import AnimatedBackground from '@/components/AnimatedBackground';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Radar de Ofertas - Monitore Preços e Economize nas Compras',
  description: 'Acompanhe a evolução de preços em tempo real com histórico completo. Sistema colaborativo que te ajuda a identificar as melhores ofertas e economizar dinheiro.',
  keywords: 'monitor de preços, comparar preços, histórico de preços, ofertas, promoções, black friday, cyber monday, economia, radar de ofertas, melhor preço',
  authors: [{ name: 'Victor Franco', url: 'https://github.com/ooVictorFranco' }],
  creator: 'Victor Franco',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Radar de Ofertas - Monitore Preços e Economize',
    description: 'Histórico completo de preços, alertas inteligentes e sistema colaborativo para encontrar as melhores ofertas.',
    siteName: 'Radar de Ofertas',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radar de Ofertas - Monitore Preços',
    description: 'Sistema colaborativo para encontrar as melhores ofertas com histórico completo de preços.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans text-gray-900`}>
        {/* Background Animado */}
        <AnimatedBackground />

        {/* Hosts/Inicializadores */}
        <ToastHost />
        <DataMigration />
        <AutoSync />
        <BackgroundRefresher />
        <LiveFileSync />
        <CompatLivePill />

        <header className="bg-white/70 backdrop-blur-md border-b border-white/20 sticky top-0 z-[200] shadow-sm">
          <nav className="mx-auto max-w-6xl px-6 h-16 flex items-center gap-3">
            <Link href="/" className="font-bold text-xl bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent transition-transform hover:scale-[1.02]">
              Radar de Ofertas
            </Link>

            {/* Desktop Navigation */}
            <div className="ml-auto hidden md:flex items-center gap-2">
              <Link href="/" className="px-4 py-2 rounded-lg hover:bg-white/60 transition-all font-medium text-gray-700 hover:text-violet-600">
                Monitorar
              </Link>
              <Link href="/favoritos" className="px-4 py-2 rounded-lg hover:bg-white/60 transition-all font-medium text-gray-700 hover:text-violet-600">
                Favoritos
              </Link>
            </div>

            {/* Mobile Navigation - Hamburger */}
            <div className="ml-auto md:hidden">
              <MobileMenu />
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
