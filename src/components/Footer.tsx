// src/components/Footer.tsx
'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-12">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sobre o projeto */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Price Watcher
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Monitore preços na Black Friday e em promoções sazonais.
              Descubra se as lojas realmente baixaram os preços ou se é só marketing.
            </p>
          </div>

          {/* Links úteis */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Links Úteis
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacidade"
                  className="text-sm text-gray-600 hover:text-blue-600 transition"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/ooVictorFranco/price-watcher"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition"
                >
                  GitHub - Código Fonte
                </a>
              </li>
            </ul>
          </div>

          {/* Contribua */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Contribua com o Projeto
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Este é um projeto open-source. Você pode sugerir melhorias,
              reportar bugs ou colaborar com o desenvolvimento.
            </p>
            <a
              href="https://github.com/ooVictorFranco/price-watcher/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              <span>📢</span>
              <span>Enviar sugestão ou reportar bug</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} Price Watcher. Código aberto sob licença MIT.
          </p>
        </div>
      </div>
    </footer>
  );
}
