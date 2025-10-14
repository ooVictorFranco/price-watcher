// src/app/changelog/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Histórico de Atualizações | Price Watcher',
  description: 'Acompanhe todas as novidades, melhorias e correções do Price Watcher. Sistema colaborativo de monitoramento de preços com histórico ilimitado e atualizações automáticas.',
  keywords: ['changelog', 'atualizações', 'novidades', 'versões', 'price watcher', 'histórico de versões'],
};

export default function ChangelogPage() {
  return (
    <main className="min-h-screen py-8 bg-gray-50">
      <div className="mx-auto w-full max-w-4xl px-6">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Histórico de Atualizações
          </h1>
          <p className="text-lg text-gray-600">
            Acompanhe todas as novidades e melhorias do Price Watcher
          </p>
        </header>

        {/* Timeline */}
        <div className="space-y-12">

          {/* v0.1.0-beta.6 */}
          <article className="bg-white rounded-2xl shadow-md p-8 border-l-4 border-blue-500">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                v0.1.0-beta.6
              </span>
              <time className="text-gray-500 text-sm">14 de outubro de 2025</time>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Histórico Inteligente e Busca Colaborativa
            </h2>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">✨ Novidades</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong>Busca com Autocomplete:</strong> Digite o nome do produto e veja sugestões instantâneas com foto e preço</li>
                  <li><strong>Histórico Global:</strong> Veja o histórico de preços coletado por toda a comunidade</li>
                  <li><strong>Filtragem Inteligente:</strong> Histórico mostra apenas mudanças reais de preço, sem poluição visual</li>
                  <li><strong>Cache Colaborativo:</strong> Produtos pesquisados por outros usuários aparecem nas suas buscas</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">🐛 Correções</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Corrigido problema de histórico vazio após carregamento</li>
                  <li>Corrigido erro ao clicar em sugestões do autocomplete</li>
                  <li>Corrigido erro do Prisma sendo executado no navegador</li>
                  <li>Melhorada sincronia de dados entre localStorage e banco de dados</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">⚡ Melhorias de Performance</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Redução de 90% nos registros exibidos com filtragem inteligente</li>
                  <li>Debounce de 300ms na busca para otimizar chamadas à API</li>
                  <li>Imagens otimizadas com Next.js Image para carregamento mais rápido</li>
                  <li>Cancelamento automático de requisições obsoletas</li>
                </ul>
              </div>
            </div>
          </article>

          {/* v0.1.0-beta.5 */}
          <article className="bg-white rounded-2xl shadow-md p-8 border-l-4 border-purple-500">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                v0.1.0-beta.5
              </span>
              <time className="text-gray-500 text-sm">14 de outubro de 2025</time>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Autocomplete e Experiência Aprimorada
            </h2>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">✨ Novidades</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong>Autocomplete Visual:</strong> Sugestões com imagem, nome e ID do produto</li>
                  <li><strong>Busca Inteligente:</strong> Encontre produtos pelo nome ou ID rapidamente</li>
                  <li><strong>Highlight de Busca:</strong> Termos pesquisados destacados em amarelo nas sugestões</li>
                </ul>
              </div>
            </div>
          </article>

          {/* v0.1.0-beta.4 */}
          <article className="bg-white rounded-2xl shadow-md p-8 border-l-4 border-green-500">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                v0.1.0-beta.4
              </span>
              <time className="text-gray-500 text-sm">13 de outubro de 2025</time>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Histórico Ilimitado e Cache Global
            </h2>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">✨ Novidades</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong>Histórico de 180 Dias:</strong> Guarde até 6 meses de variações de preço</li>
                  <li><strong>Filtros de Período:</strong> Visualize histórico por dia, semana, mês ou trimestre</li>
                  <li><strong>Cache Compartilhado:</strong> Produtos pesquisados ficam disponíveis para todos os usuários por 60 minutos</li>
                  <li><strong>Atualização Diária:</strong> Preços atualizados automaticamente todos os dias às 9h</li>
                  <li><strong>Limpeza Automática:</strong> Dados antigos removidos automaticamente após 180 dias</li>
                </ul>
              </div>
            </div>
          </article>

          {/* v0.1.0-beta.3 */}
          <article className="bg-white rounded-2xl shadow-md p-8 border-l-4 border-yellow-500">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-4 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                v0.1.0-beta.3
              </span>
              <time className="text-gray-500 text-sm">12 de outubro de 2025</time>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Backend com PostgreSQL
            </h2>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">✨ Novidades</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong>Banco de Dados:</strong> PostgreSQL (Neon) para armazenamento confiável e escalável</li>
                  <li><strong>Sincronização Multi-dispositivo:</strong> Acesse seus favoritos de qualquer lugar</li>
                  <li><strong>Migração Automática:</strong> Dados do navegador migrados automaticamente para o banco</li>
                  <li><strong>Privacidade Garantida:</strong> Sistema anônimo com UUID, sem coleta de dados pessoais</li>
                </ul>
              </div>
            </div>
          </article>

          {/* v0.1.0-beta.2 */}
          <article className="bg-white rounded-2xl shadow-md p-8 border-l-4 border-orange-500">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-4 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                v0.1.0-beta.2
              </span>
              <time className="text-gray-500 text-sm">11 de outubro de 2025</time>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Grupos e Comparações
            </h2>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">✨ Novidades</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong>Grupos de Produtos:</strong> Organize favoritos em categorias personalizadas</li>
                  <li><strong>Gráfico Comparativo:</strong> Compare preços de múltiplos produtos no mesmo gráfico</li>
                  <li><strong>Cor por Produto:</strong> Cada produto tem uma cor única para facilitar identificação</li>
                </ul>
              </div>
            </div>
          </article>

          {/* v0.1.0-beta.1 */}
          <article className="bg-white rounded-2xl shadow-md p-8 border-l-4 border-red-500">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                v0.1.0-beta.1
              </span>
              <time className="text-gray-500 text-sm">10 de outubro de 2025</time>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Lançamento Inicial
            </h2>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">✨ Funcionalidades</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong>Monitoramento de Preços:</strong> KaBuM e Amazon suportados</li>
                  <li><strong>Histórico Visual:</strong> Gráficos interativos com evolução de preços</li>
                  <li><strong>Favoritos:</strong> Salve produtos para acompanhar facilmente</li>
                  <li><strong>Preço à Vista e Parcelado:</strong> Acompanhe ambas as formas de pagamento</li>
                  <li><strong>Responsivo:</strong> Funciona perfeitamente em mobile, tablet e desktop</li>
                </ul>
              </div>
            </div>
          </article>

        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Quer sugerir uma nova funcionalidade?
            </h3>
            <p className="mb-6 text-blue-100">
              Estamos sempre melhorando! Compartilhe suas ideias conosco.
            </p>
            <a
              href="https://github.com/ooVictorFranco/price-watcher/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Enviar Sugestão
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
