// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'KaBuM! – Monitor de Preços',
  description: 'Monitoramento, favoritos e comparativo de preços no KaBuM!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900`}>
        <header className="bg-white border-b">
          <nav className="mx-auto max-w-6xl px-6 h-14 flex items-center gap-4">
            <Link href="/" className="font-semibold">KaBuM! – Monitor</Link>
            <div className="ml-auto flex items-center gap-3 text-sm">
              <Link href="/" className="px-3 py-1 rounded-lg hover:bg-gray-100">Monitorar</Link>
              <Link href="/favoritos" className="px-3 py-1 rounded-lg hover:bg-gray-100">Favoritos & Comparar</Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
