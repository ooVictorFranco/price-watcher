// src/app/privacidade/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PrivacidadePage() {
  useEffect(() => {
    document.title = 'Política de Privacidade — Radar de Ofertas';
  }, []);

  return (
    <main className="min-h-screen py-12">
      <div className="mx-auto w-full max-w-4xl px-6">
        <article className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg p-10 space-y-6">
          <header className="space-y-4 border-b border-gray-200 pb-6">
            <h1 className="text-4xl font-black bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">Política de Privacidade</h1>
            <p className="text-sm text-gray-600">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">1. Sobre o Radar de Ofertas</h2>
            <p className="text-gray-700 leading-relaxed">
              O <strong>Radar de Ofertas</strong> (anteriormente Price Watcher) é uma aplicação open-source projetada
              para ajudar consumidores a monitorarem preços de produtos em lojas online brasileiras (KaBuM! e Amazon)
              durante períodos promocionais como Black Friday, Cyber Monday e outras datas sazonais. Nosso objetivo é
              trazer transparência e ajudar você a identificar se os descontos anunciados são reais ou apenas estratégias
              de marketing.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">2. Disclaimer Importante: Sobre os Preços Exibidos</h2>
            <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-5 space-y-3">
              <p className="text-orange-900 font-semibold text-lg mb-3">
                ⚠️ Importante: Leia com Atenção
              </p>

              <div className="space-y-3 text-orange-900">
                <p className="leading-relaxed">
                  <strong>Os preços exibidos nesta plataforma são coletados automaticamente e podem não refletir
                  os valores exatos praticados pelas lojas.</strong> As variações de preço podem ocorrer por diversos motivos:
                </p>

                <ul className="list-disc list-inside space-y-2 ml-4 text-orange-800">
                  <li>
                    <strong>Diferenças entre formas de pagamento:</strong> O preço à vista (PIX) pode ser diferente
                    do preço no boleto ou no cartão de crédito em 1x. Cada loja define suas próprias políticas de desconto.
                  </li>
                  <li>
                    <strong>Promoções regionais:</strong> Algumas lojas aplicam preços diferentes baseados na localização
                    geográfica do usuário ou disponibilidade regional.
                  </li>
                  <li>
                    <strong>Erros de coleta:</strong> Embora nos esforcemos para coletar dados precisos, mudanças no
                    layout das lojas ou problemas técnicos podem resultar em informações incorretas.
                  </li>
                  <li>
                    <strong>Atualização defasada:</strong> Os preços são atualizados periodicamente, mas podem não
                    refletir promoções relâmpago ou alterações em tempo real.
                  </li>
                  <li>
                    <strong>Disponibilidade de estoque:</strong> Produtos podem estar indisponíveis mesmo que exibam preço.
                  </li>
                </ul>

                <div className="bg-white/50 rounded-lg p-4 mt-4 border border-orange-200">
                  <p className="font-semibold text-orange-900 mb-2">📊 Como funciona a coleta colaborativa:</p>
                  <p className="text-orange-800 leading-relaxed">
                    O Radar de Ofertas funciona de forma <strong>colaborativa</strong>: quanto mais pessoas usam a
                    ferramenta, mais dados verdadeiros conseguimos coletar sobre os preços. Cada busca realizada
                    alimenta nosso banco de dados compartilhado, beneficiando toda a comunidade com informações
                    mais precisas e atualizadas.
                  </p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 mt-4 border-2 border-red-300">
                  <p className="font-semibold text-red-900 mb-2">🚫 Responsabilidade e Isenção:</p>
                  <ul className="list-disc list-inside space-y-1 text-red-800 ml-2">
                    <li>
                      <strong>Sem vínculo com lojas:</strong> O Radar de Ofertas não tem nenhum compromisso,
                      parceria ou obrigação com as lojas monitoradas.
                    </li>
                    <li>
                      <strong>Ferramenta informativa:</strong> Esta plataforma serve apenas como referência e
                      não garante a exatidão dos preços exibidos.
                    </li>
                    <li>
                      <strong>Verificação obrigatória:</strong> Sempre confira o preço final diretamente no
                      site da loja antes de realizar qualquer compra.
                    </li>
                    <li>
                      <strong>Sem responsabilidade por divergências:</strong> Não nos responsabilizamos por
                      diferenças entre os preços exibidos aqui e os praticados pelas lojas.
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-orange-700 italic mt-4">
                  💡 <strong>Dica:</strong> Use o Radar de Ofertas como uma ferramenta de <em>monitoramento e
                  comparação de tendências</em>, não como fonte definitiva de preços. O valor apresentado pelas
                  lojas em seus sites oficiais é sempre o que prevalece.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">3. Dados que NÃO coletamos</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <p className="text-green-900 font-medium">
                ✅ O Radar de Ofertas NÃO coleta, armazena ou transmite NENHUM dos seguintes dados:
              </p>
              <ul className="list-disc list-inside space-y-1 text-green-800 ml-4">
                <li>Dados pessoais (nome, CPF, e-mail, telefone)</li>
                <li>Dados de navegação ou comportamento</li>
                <li>Endereço IP ou localização geográfica</li>
                <li>Cookies de rastreamento ou analytics</li>
                <li>Histórico de compras ou preferências de navegação</li>
                <li>Informações de pagamento ou cartão de crédito</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">3. Armazenamento de dados</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <p className="text-blue-900 font-medium">
                📦 Seus dados são armazenados de duas formas:
              </p>

              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-blue-900 mb-2">A) Banco de Dados Neon (PostgreSQL)</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800 ml-4">
                    <li>
                      <strong>Identificação anônima:</strong> Um ID único gerado no seu navegador (sessionId) para associar seus dados
                    </li>
                    <li>
                      <strong>Lista de favoritos:</strong> IDs dos produtos que você marcou como favoritos
                    </li>
                    <li>
                      <strong>Histórico de preços:</strong> Snapshots de preços coletados automaticamente
                    </li>
                    <li>
                      <strong>Grupos de produtos:</strong> Agrupamentos para comparação entre lojas
                    </li>
                    <li>
                      <strong>Metadados:</strong> Nome e imagem dos produtos (obtidos das lojas)
                    </li>
                  </ul>
                  <p className="text-sm text-blue-700 mt-2">
                    ℹ️ O banco de dados permite atualização automática de preços mesmo com o navegador fechado e sincronização entre dispositivos.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-blue-900 mb-2">B) Armazenamento Local (localStorage/IndexedDB)</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800 ml-4">
                    <li>
                      <strong>SessionId:</strong> Identificador único do seu dispositivo
                    </li>
                    <li>
                      <strong>Cache local:</strong> Cópia dos dados para acesso offline
                    </li>
                    <li>
                      <strong>Configurações:</strong> Preferências de exibição e backup
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
              <p className="text-yellow-900 font-medium mb-2">⚠️ Importante sobre privacidade:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-800 ml-4">
                <li>Não coletamos dados pessoais identificáveis (nome, email, CPF)</li>
                <li>O sessionId é apenas um UUID aleatório, não pode ser usado para te identificar</li>
                <li>Não há autenticação ou login - você não precisa criar conta</li>
                <li>Os dados das lojas (preços) são públicos e obtidos via web scraping</li>
                <li>Você pode exportar ou deletar todos os seus dados a qualquer momento</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">4. Como funciona o monitoramento de preços</h2>
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                O Radar de Ofertas utiliza técnicas de web scraping para coletar informações públicas de preços
                diretamente das páginas das lojas online. O processo funciona da seguinte forma:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  <strong>Você fornece o identificador do produto:</strong> Pode ser o ID numérico do KaBuM!
                  (ex: 922662) ou o ASIN da Amazon (ex: B0F7Z9F9SD), ou as URLs completas dos produtos.
                </li>
                <li>
                  <strong>Consulta automática:</strong> A aplicação faz uma requisição HTTP à página do produto
                  nas lojas (via API interna do Next.js que roda no servidor).
                </li>
                <li>
                  <strong>Extração de dados:</strong> Utilizamos bibliotecas como Cheerio (para HTML parsing)
                  para extrair apenas informações de preços e metadados básicos (nome, imagem).
                </li>
                <li>
                  <strong>Armazenamento local:</strong> Os preços extraídos são salvos no localStorage do navegador
                  junto com um timestamp, criando um histórico temporal.
                </li>
                <li>
                  <strong>Atualização automática:</strong> Um cron job na Vercel atualiza automaticamente os preços
                  de todos os produtos 1 vez por dia às 09:00, mesmo quando você não está com o navegador aberto.
                </li>
              </ol>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4 space-y-2">
                <p className="font-semibold text-purple-900 mb-2">🚀 Cache Compartilhado com TTL de 60 minutos</p>
                <p className="text-purple-800 leading-relaxed">
                  Para melhorar a experiência de todos os usuários e reduzir requisições desnecessárias às lojas,
                  implementamos um <strong>sistema de cache compartilhado inteligente</strong>:
                </p>
                <ul className="list-disc list-inside space-y-1 text-purple-800 ml-4">
                  <li>
                    <strong>Todas as buscas são salvas:</strong> Quando você pesquisa um produto (mesmo sem favoritar),
                    os dados são salvos no banco de dados global
                  </li>
                  <li>
                    <strong>Benefício coletivo:</strong> Se outro usuário buscar o mesmo produto em até 60 minutos,
                    os dados vêm do cache instantaneamente (sem scraping)
                  </li>
                  <li>
                    <strong>Atualização inteligente:</strong> Após 60 minutos, uma nova busca atualiza o cache para todos
                    os usuários, garantindo preços sempre atualizados
                  </li>
                  <li>
                    <strong>Cron diário:</strong> Às 09:00, todos os produtos favoritos são atualizados automaticamente
                    pelo cron job da Vercel (plano Hobby permite 1x por dia)
                  </li>
                  <li>
                    <strong>Privacidade mantida:</strong> Apenas o ID do produto é compartilhado, não seus favoritos
                    ou seu histórico pessoal
                  </li>
                </ul>
                <p className="text-sm text-purple-700 mt-2">
                  ℹ️ <strong>Exemplo prático:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-purple-700 text-sm ml-4 mt-1">
                  <li>10:00 - Usuário A busca uma RTX 4090 → Scraping + Salva cache</li>
                  <li>10:30 - Usuário B busca a mesma RTX 4090 → Usa cache (instantâneo)</li>
                  <li>10:59 - Usuário C busca → Usa cache (ainda válido)</li>
                  <li>11:05 - Usuário D busca → Novo scraping (cache expirou) + Atualiza para todos</li>
                </ul>
                <p className="text-sm text-purple-700 mt-2">
                  Quanto mais pessoas usam, mais rápido e eficiente o sistema fica para todos!
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed mt-3">
                <strong>Transparência:</strong> Todo o código-fonte está disponível no{' '}
                <a
                  href="https://github.com/ooVictorFranco/price-watcher"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  GitHub
                </a>
                . Você pode auditar exatamente como os dados são coletados e processados.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">5. Infraestrutura e hospedagem</h2>
            <p className="text-gray-700 leading-relaxed">
              O Radar de Ofertas é hospedado na <strong>Vercel</strong> (plataforma de hospedagem)
              e utiliza o banco de dados <strong>Neon PostgreSQL</strong> (serverless) para armazenamento.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-gray-900">Garantias de privacidade:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Ambos os provedores estão em conformidade com LGPD e GDPR</li>
                <li>Conexões protegidas por SSL/TLS (HTTPS)</li>
                <li>Banco de dados acessível apenas pela aplicação (não público)</li>
                <li>Dados criptografados em trânsito e em repouso</li>
                <li>Sem compartilhamento de dados com terceiros</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">6. Conformidade com lojas online</h2>
            <p className="text-gray-700 leading-relaxed">
              O Radar de Ofertas acessa apenas informações públicas disponíveis nas páginas de produtos das lojas.
              Não fazemos login em contas, não acessamos áreas restritas e respeitamos os robots.txt das lojas.
              As requisições são feitas de forma responsável para não sobrecarregar os servidores das lojas.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Nota:</strong> Se você representa uma loja e tem preocupações sobre o uso desta ferramenta,
              entre em contato através do GitHub. Estamos abertos ao diálogo e comprometidos com práticas éticas.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">7. Backup e exportação de dados</h2>
            <p className="text-gray-700 leading-relaxed">
              Você tem controle total sobre seus dados:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>
                <strong>Exportar JSON:</strong> Baixe todos os seus favoritos e histórico de preços em formato JSON
                para backup local ou migração.
              </li>
              <li>
                <strong>Importar JSON:</strong> Restaure seus dados a partir de um backup anterior.
              </li>
              <li>
                <strong>Arquivo Vivo:</strong> Mantém um arquivo sincronizado automaticamente no seu sistema de arquivos local
                (requer suporte a File System Access API).
              </li>
              <li>
                <strong>Retenção de 180 dias:</strong> O banco de dados mantém histórico de preços por 180 dias (6 meses).
                Um cron job diário (02:00) remove automaticamente dados mais antigos que isso.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">8. Tecnologias utilizadas</h2>
            <p className="text-gray-700 leading-relaxed">
              O Radar de Ofertas é construído com tecnologias web modernas:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li><strong>Next.js 15:</strong> Framework React para renderização e API routes</li>
              <li><strong>React 19:</strong> Biblioteca UI para interface interativa</li>
              <li><strong>TypeScript:</strong> Tipagem estática para maior confiabilidade</li>
              <li><strong>PostgreSQL (Neon):</strong> Banco de dados serverless para armazenamento confiável</li>
              <li><strong>Prisma ORM:</strong> Interface segura com o banco de dados</li>
              <li><strong>LocalStorage & IndexedDB:</strong> Cache local no navegador</li>
              <li><strong>Cheerio:</strong> Parsing de HTML para extração de dados</li>
              <li><strong>Chart.js:</strong> Visualização de gráficos de histórico de preços</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">9. Seus direitos</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                <li>Você pode deletar todos os seus dados a qualquer momento limpando o cache do navegador</li>
                <li>Você pode exportar seus dados em formato JSON</li>
                <li>Você pode parar de usar o serviço a qualquer momento sem consequências</li>
                <li>Você tem acesso ao código-fonte completo e pode auditá-lo</li>
                <li>Você pode fazer fork do projeto e modificá-lo conforme suas necessidades</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">10. Alterações nesta política</h2>
            <p className="text-gray-700 leading-relaxed">
              Como este é um projeto open-source em evolução, esta política de privacidade pode ser atualizada.
              Mudanças significativas serão comunicadas através do repositório GitHub. A data da última atualização
              está sempre visível no topo desta página.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">11. Contato e contribuições</h2>
            <p className="text-gray-700 leading-relaxed">
              Este projeto é mantido pela comunidade. Se você tiver dúvidas, sugestões ou quiser contribuir:
            </p>
            <div className="flex flex-col gap-3 mt-3">
              <a
                href="https://github.com/ooVictorFranco/price-watcher"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <span>🔗</span>
                <span>Repositório no GitHub</span>
              </a>
              <a
                href="https://github.com/ooVictorFranco/price-watcher/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <span>📢</span>
                <span>Reportar problemas ou sugerir melhorias</span>
              </a>
            </div>
          </section>

          <footer className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-600">
              <strong>Resumo:</strong> O Radar de Ofertas não coleta dados pessoais identificáveis, não usa analytics
              de terceiros e é 100% transparente com código aberto. Seus dados são armazenados de forma segura
              em banco de dados PostgreSQL (Neon) usando apenas um ID anônimo para associação. Você tem controle
              total sobre seus dados e pode exportá-los ou deletá-los a qualquer momento.
            </p>
            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                ← Voltar para o início
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </main>
  );
}
