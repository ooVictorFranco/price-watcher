// src/components/Footer.tsx
'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/20 bg-white/50 backdrop-blur-sm mt-16">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Sobre o projeto */}
          <div>
            <h3 className="text-base font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Radar de Ofertas
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nunca mais pague mais caro! Acompanhe a evolução real de preços e descubra
              quando as ofertas são verdadeiras. Sistema colaborativo que te ajuda a economizar.
            </p>
          </div>

          {/* Links úteis */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Navegação
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-violet-600 transition-colors inline-flex items-center gap-2"
                >
                  <span>🔍</span>
                  <span>Monitorar Preços</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/favoritos"
                  className="text-sm text-gray-600 hover:text-violet-600 transition-colors inline-flex items-center gap-2"
                >
                  <span>⭐</span>
                  <span>Meus Favoritos</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-sm text-gray-600 hover:text-violet-600 transition-colors inline-flex items-center gap-2"
                >
                  <span>📝</span>
                  <span>Novidades</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="text-sm text-gray-600 hover:text-violet-600 transition-colors inline-flex items-center gap-2"
                >
                  <span>🔒</span>
                  <span>Privacidade</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Comunidade */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Comunidade
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Projeto 100% open-source. Contribua, sugira melhorias ou reporte problemas!
            </p>
            <div className="space-y-2">
              <a
                href="https://github.com/ooVictorFranco/price-watcher"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-violet-600 transition-colors"
              >
                <span>📦</span>
                <span>Código Fonte</span>
              </a>
              <br />
              <a
                href="https://github.com/ooVictorFranco/price-watcher/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
              >
                <span>💬</span>
                <span>Sugerir Melhoria</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Radar de Ofertas. Código aberto sob licença MIT.
            </p>
            <p className="text-xs text-gray-400">
              Feito com 💜 para ajudar você a economizar
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
