// src/app/privacidade/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PrivacidadePage() {
  useEffect(() => {
    document.title = 'Política de Privacidade — Price Watcher';
  }, []);

  return (
    <main className="min-h-screen py-8">
      <div className="mx-auto w-full max-w-4xl px-6">
        <article className="bg-white rounded-2xl border shadow-md p-8 space-y-6">
          <header className="space-y-3 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
            <p className="text-sm text-gray-600">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">1. Sobre o Price Watcher</h2>
            <p className="text-gray-700 leading-relaxed">
              O <strong>Price Watcher</strong> é uma aplicação open-source projetada para ajudar consumidores
              a monitorarem preços de produtos em lojas online brasileiras (KaBuM! e Amazon) durante períodos
              promocionais como Black Friday, Cyber Monday e outras datas sazonais. Nosso objetivo é trazer
              transparência e ajudar você a identificar se os descontos anunciados são reais ou apenas estratégias
              de marketing.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">2. Dados que NÃO coletamos</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <p className="text-green-900 font-medium">
                ✅ O Price Watcher NÃO coleta, armazena ou transmite NENHUM dos seguintes dados:
              </p>
              <ul className="list-disc list-inside space-y-1 text-green-800 ml-4">
                <li>Dados pessoais (nome, CPF, e-mail, telefone)</li>
                <li>Dados de navegação ou comportamento</li>
                <li>Endereço IP ou localização geográfica</li>
                <li>Cookies de rastreamento ou analytics</li>
                <li>Histórico de compras ou preferências de navegação</li>
                <li>Informações de pagamento ou cartão de crédito</li>
                <li>Nenhum dado é enviado para servidores externos</li>
              </ul>
            </div>
            <p className="text-gray-700 leading-relaxed">
              A aplicação funciona <strong>100% no seu navegador</strong> (client-side). Não temos servidores
              que armazenem seus dados, nem coletamos telemetria ou analytics de qualquer tipo.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">3. Dados armazenados localmente</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <p className="text-blue-900 font-medium">
                📦 Os seguintes dados são armazenados APENAS no seu navegador (localStorage):
              </p>
              <ul className="list-disc list-inside space-y-2 text-blue-800 ml-4">
                <li>
                  <strong>Lista de favoritos:</strong> IDs dos produtos que você marcou como favoritos
                  (números do KaBuM! ou ASINs da Amazon)
                </li>
                <li>
                  <strong>Histórico de preços:</strong> Registros históricos dos preços coletados para cada produto
                  (preço à vista, parcelado e original)
                </li>
                <li>
                  <strong>Metadados dos produtos:</strong> Nome do produto e URL da imagem (obtidos das lojas)
                </li>
                <li>
                  <strong>Configurações:</strong> Preferências de exibição e configurações do &quot;Arquivo Vivo&quot;
                </li>
                <li>
                  <strong>Grupos de produtos:</strong> Agrupamentos criados por você para comparar o mesmo produto
                  em lojas diferentes
                </li>
              </ul>
            </div>
            <p className="text-gray-700 leading-relaxed">
              <strong>Importante:</strong> Esses dados permanecem exclusivamente no seu dispositivo.
              Se você limpar o cache/histórico do navegador ou usar o modo anônimo, esses dados serão perdidos.
              Por isso, recomendamos usar a função de <strong>Backup → Exportar JSON</strong> ou ativar o
              <strong> Arquivo Vivo</strong> para manter seus dados seguros.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">4. Como funciona o monitoramento de preços</h2>
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                O Price Watcher utiliza técnicas de web scraping para coletar informações públicas de preços
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
                  <strong>Atualização periódica:</strong> Enquanto você mantiver uma aba do app aberta (mesmo em segundo plano),
                  a aplicação verifica automaticamente os preços a cada 3 horas.
                </li>
              </ol>
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
            <h2 className="text-xl font-semibold text-gray-900">5. Conformidade com lojas online</h2>
            <p className="text-gray-700 leading-relaxed">
              O Price Watcher acessa apenas informações públicas disponíveis nas páginas de produtos das lojas.
              Não fazemos login em contas, não acessamos áreas restritas e respeitamos os robots.txt das lojas.
              As requisições são feitas de forma responsável para não sobrecarregar os servidores das lojas.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Nota:</strong> Se você representa uma loja e tem preocupações sobre o uso desta ferramenta,
              entre em contato através do GitHub. Estamos abertos ao diálogo e comprometidos com práticas éticas.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">6. Backup e exportação de dados</h2>
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
                <strong>Retenção de 90 dias:</strong> Por padrão, o histórico mantém apenas os últimos 90 dias
                para evitar uso excessivo de espaço no navegador.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">7. Tecnologias utilizadas</h2>
            <p className="text-gray-700 leading-relaxed">
              O Price Watcher é construído com tecnologias web modernas:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li><strong>Next.js 15:</strong> Framework React para renderização e API routes</li>
              <li><strong>React 19:</strong> Biblioteca UI para interface interativa</li>
              <li><strong>TypeScript:</strong> Tipagem estática para maior confiabilidade</li>
              <li><strong>LocalStorage & IndexedDB:</strong> Armazenamento local no navegador</li>
              <li><strong>Cheerio:</strong> Parsing de HTML para extração de dados</li>
              <li><strong>Chart.js:</strong> Visualização de gráficos de histórico de preços</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">8. Seus direitos</h2>
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
            <h2 className="text-xl font-semibold text-gray-900">9. Alterações nesta política</h2>
            <p className="text-gray-700 leading-relaxed">
              Como este é um projeto open-source em evolução, esta política de privacidade pode ser atualizada.
              Mudanças significativas serão comunicadas através do repositório GitHub. A data da última atualização
              está sempre visível no topo desta página.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">10. Contato e contribuições</h2>
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
              <strong>Resumo:</strong> O Price Watcher não coleta dados pessoais, não usa analytics,
              não armazena dados em servidores externos e é 100% transparente com código aberto.
              Todos os dados ficam no seu navegador e você tem controle total sobre eles.
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
