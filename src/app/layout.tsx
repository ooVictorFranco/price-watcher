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
  title: {
    default: 'Radar de Ofertas - Monitore Preços e Economize nas Compras',
    template: '%s | Radar de Ofertas',
  },
  description: 'Sistema colaborativo de monitoramento de preços com histórico ilimitado. Acompanhe a evolução de preços da KaBuM e Amazon, descubra se as ofertas são reais e economize dinheiro. Atualização automática diária.',
  keywords: [
    'monitor de preços',
    'comparar preços',
    'histórico de preços',
    'ofertas',
    'promoções',
    'black friday',
    'cyber monday',
    'economia',
    'radar de ofertas',
    'melhor preço',
    'kabum',
    'amazon',
    'price tracker',
    'acompanhar preços',
    'desconto',
  ],
  authors: [{ name: 'Victor Franco', url: 'https://github.com/ooVictorFranco' }],
  creator: 'Victor Franco',
  publisher: 'Victor Franco',
  applicationName: 'Radar de Ofertas',
  category: 'Shopping',
  classification: 'Price Tracking & Comparison',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://price-watcher-kappa.vercel.app',
    title: 'Radar de Ofertas - Monitore Preços e Economize',
    description: 'Histórico completo de preços, atualização automática e sistema colaborativo para encontrar as melhores ofertas da KaBuM e Amazon.',
    siteName: 'Radar de Ofertas',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Radar de Ofertas - Monitor de Preços',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radar de Ofertas - Monitore Preços',
    description: 'Sistema colaborativo para encontrar as melhores ofertas com histórico completo de preços da KaBuM e Amazon.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Adicione seus códigos de verificação aqui quando obtê-los
    // google: 'seu-codigo-google-search-console',
    // yandex: 'seu-codigo-yandex',
    // bing: 'seu-codigo-bing',
  },
  alternates: {
    canonical: 'https://price-watcher-kappa.vercel.app',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Radar de Ofertas" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Structured Data - Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Radar de Ofertas',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'BRL',
              },
              description: 'Sistema colaborativo de monitoramento de preços com histórico ilimitado. Acompanhe ofertas da KaBuM e Amazon.',
              url: 'https://price-watcher-kappa.vercel.app',
              author: {
                '@type': 'Person',
                name: 'Victor Franco',
                url: 'https://github.com/ooVictorFranco',
              },
              provider: {
                '@type': 'Organization',
                name: 'Radar de Ofertas',
              },
              browserRequirements: 'Requires JavaScript. Requires HTML5.',
              softwareVersion: '0.1.0-beta.7',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '5',
                reviewCount: '1',
              },
            }),
          }}
        />
      </head>
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
