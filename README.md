# 🛒 Price Watcher

**Descubra se as lojas realmente baixaram os preços na Black Friday!** Monitor inteligente de preços para **KaBuM!** e **Amazon**, com histórico completo, comparação entre lojas e atualização automática. Identifique falsos descontos em promoções sazonais.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## 📋 Sobre o Projeto

**Price Watcher** é uma aplicação web open-source projetada para ajudar consumidores brasileiros a monitorarem preços de produtos durante períodos promocionais como **Black Friday**, **Cyber Monday** e outras datas sazonais.

O objetivo é trazer **transparência** e ajudar você a identificar se os descontos anunciados são reais ou apenas estratégias de marketing, mantendo um histórico completo de preços ao longo do tempo.

### ✨ Principais Funcionalidades

#### 🎯 Monitoramento Inteligente
- 🔍 **Múltiplas Lojas**: Monitore produtos da KaBuM! (ID ou URL) e Amazon (ASIN ou URL, incluindo links encurtados)
- 📊 **Histórico Completo**: Gráficos interativos mostrando a evolução dos preços (à vista, parcelado e original)
- 🔄 **Atualização Automática**: Preços atualizados automaticamente **a cada 3 horas, mesmo com navegador fechado** (Vercel Cron Jobs)
- ☁️ **Sincronização na Nuvem**: Dados armazenados em PostgreSQL (Neon) e sincronizados entre dispositivos
- ⏰ **Histórico Ilimitado**: Acompanhe a variação de preços sem limite de tempo

#### ⭐ Favoritos e Organização
- 💾 **Favoritos Ilimitados**: Sem limite de produtos (anteriormente limitado a 25)
- 📦 **Grupos Unificados**: Agrupe o mesmo produto de lojas diferentes para comparar preços lado a lado
- 🏷️ **Gerenciamento Completo**: Adicione, remova, mova produtos entre grupos ou renomeie/delete grupos
- 💰 **Badge "MELHOR PREÇO"**: Identifique automaticamente qual loja oferece o menor preço no grupo

#### 📈 Comparação e Análise
- 🔀 **Compare Múltiplos Produtos**: Selecione vários produtos e visualize gráficos comparativos unificados
- 📉 **3 Métricas**: À vista, parcelado ou preço original
- 🎨 **Gráficos de Histórico do Grupo**: Visualize a evolução de preços de produtos agrupados ao longo do tempo

#### 💾 Backup de Dados
- 📤 **Exportar/Importar JSON**: Faça backup completo de todos os seus dados
- 🔗 **Arquivo Vivo**: Sincronização automática com arquivo local (Chrome/Edge)

#### 🎨 UX/UI Moderna
- 📱 **Totalmente Responsivo**: Interface otimizada para desktop, tablet e mobile
- ♿ **Acessibilidade**: Conformidade com WCAG 2.1 Level AA
- 🎭 **Animações Sutis**: Micro-interações com Framer Motion, respeitando preferências de movimento reduzido
- 🌈 **Design Limpo**: Gradientes suaves, cards organizados, feedback visual claro

### 🎯 Dados Monitorados

Para cada produto, o sistema rastreia:
- ✅ Preço à vista (cash payment)
- ✅ Preço parcelado (installment price)
- ✅ Preço original (de/por - "was/now")
- ✅ Desconto percentual calculado
- ✅ Histórico de variações (últimos 90 dias)
- ✅ Timestamp de última atualização
- ✅ Nome do produto e imagem (metadados)
- ✅ Identificação da loja (provider badge)

## 🚀 Tecnologias

Este projeto foi desenvolvido com tecnologias web modernas:

### Core
- [Next.js 15.5.4](https://nextjs.org/) - Framework React com App Router e Turbopack
- [React 19](https://react.dev/) - Biblioteca UI com hooks modernos
- [TypeScript 5](https://www.typescriptlang.org/) - Tipagem estática para maior confiabilidade
- [Tailwind CSS 4](https://tailwindcss.com/) - Framework CSS utilitário

### UI/UX
- [Framer Motion](https://www.framer.com/motion/) - Animações fluidas e transições
- [Chart.js](https://www.chartjs.org/) - Gráficos interativos de histórico de preços
- [Next/Image](https://nextjs.org/docs/app/api-reference/components/image) - Otimização automática de imagens

### Data & Storage
- [PostgreSQL (Neon)](https://neon.tech/) - Banco de dados serverless para armazenamento confiável e sincronizado
- [Prisma ORM](https://www.prisma.io/) - Interface type-safe com o banco de dados
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) - Cache local de dados
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - Cache de histórico de preços
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) - Arquivo vivo para backup automático

### Web Scraping & Automation
- [Cheerio](https://cheerio.js.org/) - Parsing de HTML para extração de dados
- Next.js API Routes - Backend serverless para scraping
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) - Atualização automática de preços a cada 3 horas

## 📦 Instalação

### Pré-requisitos

- Node.js 20.x ou superior
- npm, yarn, pnpm ou bun

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/ooVictorFranco/price-watcher.git
   cd price-watcher
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Configure o banco de dados** (obrigatório para atualização automática)

   O projeto utiliza PostgreSQL (Neon) para armazenamento e atualização automática de preços.

   **Para uso completo com atualização automática:**
   - Siga o guia completo: [DATABASE_SETUP.md](DATABASE_SETUP.md)
   - Ou guia rápido: [QUICKSTART_DATABASE.md](QUICKSTART_DATABASE.md)

   **Para testes locais (sem banco):**
   - A aplicação funcionará, mas sem sincronização entre dispositivos
   - A atualização de preços só ocorrerá manualmente ou com o navegador aberto

4. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

5. **Acesse a aplicação**

   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento com hot-reload e Turbopack
npm run dev

# Build de produção otimizado (gera Prisma Client automaticamente)
npm run build

# Iniciar servidor de produção
npm run start

# Executar linter (ESLint)
npm run lint

# Prisma (banco de dados)
npx prisma generate     # Gera o Prisma Client
npx prisma db push      # Sincroniza schema com o banco de dados
npx prisma studio       # Abre interface visual do banco de dados
```

## 📖 Como Usar

### 1. Monitorar um Produto

Na página **Monitoramento** (página inicial):

**KaBuM!:**
- Cole o ID do produto (ex: `922662`)
- Ou cole a URL completa (ex: `https://www.kabum.com.br/produto/922662`)

**Amazon:**
- Cole o ASIN (ex: `B0F7Z9F9SD`)
- Ou cole a URL completa (ex: `https://www.amazon.com.br/dp/B0F7Z9F9SD`)
- Funciona com links encurtados: `https://a.co/d/3K52ue9` ou `https://amzn.to/xyz`

O sistema começará a monitorar o produto automaticamente e criará um histórico de preços.

### 2. Adicionar aos Favoritos

- Clique no botão **⭐ Favoritar** no produto monitorado
- **Sem limite**: Adicione quantos produtos quiser!
- Os favoritos são salvos localmente no seu navegador

### 3. Criar Grupos de Produtos Unificados

Agrupe o mesmo produto de lojas diferentes para comparar preços:

1. Vá para **Favoritos & Comparar**
2. Selecione 2 ou mais produtos (checkboxes)
3. Clique em **Unificar produtos**
4. Digite um nome para o grupo (ex: "Placa de Vídeo RTX 4060")
5. O grupo exibirá automaticamente qual loja tem o melhor preço

**Gerenciamento de Grupos:**
- **Renomear**: Menu ⋯ do grupo → Renomear grupo
- **Excluir**: Menu ⋯ do grupo → Excluir grupo
- **Adicionar produto**: Menu ⋯ do produto → Adicionar a grupo
- **Remover do grupo**: Menu ⋯ do produto → Gerenciar grupo → Remover
- **Mover entre grupos**: Menu ⋯ do produto → Gerenciar grupo → Mover

### 4. Comparar Produtos

Compare múltiplos produtos individualmente (fora de grupos):

1. Na página **Favoritos & Comparar**
2. Selecione os checkboxes de 2 ou mais produtos
3. Clique em **Comparar selecionados**
4. Escolha a métrica (À vista, Parcelado ou Original)
5. Visualize o gráfico unificado com todas as linhas

### 5. Backup de Dados

- Menu **Backup** → **Exportar JSON**: Salva todos os dados (favoritos, histórico, grupos)
- Menu **Backup** → **Importar JSON**: Mescla dados importados com os existentes
- Menu **Backup** → **Vincular arquivo (nativo)**: Sincronização automática (Chrome/Edge)

## 🏗️ Estrutura do Projeto

```
price-watcher/
├── src/
│   ├── app/                          # Páginas Next.js (App Router)
│   │   ├── layout.tsx                # Layout raiz com SEO otimizado
│   │   ├── page.tsx                  # Página de monitoramento
│   │   ├── favoritos/                # Página de favoritos e comparação
│   │   │   └── page.tsx
│   │   ├── privacidade/              # Página de política de privacidade
│   │   │   └── page.tsx
│   │   └── api/                      # API Routes para scraping
│   │       ├── scrape/route.ts       # Scraper KaBuM!
│   │       ├── scrape-amazon/route.ts # Scraper Amazon
│   │       └── search/route.ts       # Busca de produtos
│   ├── components/                   # Componentes React
│   │   ├── FavoritesList.tsx         # Lista de favoritos com grupos
│   │   ├── ProductCard.tsx           # Card de produto individual
│   │   ├── GroupCard.tsx             # Card de grupo unificado
│   │   ├── GroupManagementModal.tsx  # Modal de gerenciamento de grupos
│   │   ├── ComparePanel.tsx          # Painel de comparação
│   │   ├── CompareChart.tsx          # Gráfico comparativo
│   │   ├── GroupCompareChart.tsx     # Gráfico de grupo
│   │   ├── BackupMenu.tsx            # Menu de backup
│   │   ├── Footer.tsx                # Rodapé com links
│   │   └── ...
│   ├── lib/                          # Utilitários e lógica de negócio
│   │   ├── utils.ts                  # Funções auxiliares, grupos
│   │   ├── backup.ts                 # Sistema de backup v2
│   │   ├── livefile.ts               # Arquivo vivo
│   │   ├── background.ts             # Atualização em segundo plano
│   │   ├── parseKabum.ts             # Parser HTML KaBuM!
│   │   ├── parseAmazon.ts            # Parser HTML Amazon
│   │   ├── toast.ts                  # Sistema de notificações
│   │   └── idb.ts                    # Wrapper IndexedDB
│   └── types/                        # Definições TypeScript
│       └── index.ts                  # Favorite, Snapshot, ProductGroup, etc.
├── public/                           # Arquivos estáticos
├── package.json                      # Dependências e scripts
├── tsconfig.json                     # Configuração TypeScript
├── tailwind.config.ts                # Configuração Tailwind CSS
├── next.config.ts                    # Configuração Next.js
└── LICENSE                           # Licença MIT

```

## 🔒 Privacidade e Segurança

### 📊 Analytics e Melhoria Contínua

O Price Watcher utiliza ferramentas de analytics focadas **exclusivamente** na melhoria da experiência do usuário:

**Ferramentas utilizadas:**
- ✅ **Vercel Analytics**: Monitora desempenho, velocidade de carregamento e Core Web Vitals
- ✅ **Vercel Speed Insights**: Analisa métricas reais de experiência (Core Web Vitals) e alerta sobre regressões
- ✅ **Microsoft Clarity**: Mapas de calor e gravações de sessão anônimas para entender interações

**Por que usamos?**
- 🐛 Identificar bugs e comportamentos inesperados
- ⚡ Otimizar tempos de carregamento e responsividade
- 🎨 Aprimorar UX identificando onde usuários encontram dificuldades
- 📈 Priorizar recursos mais utilizados

**Garantias de privacidade:**
- 🔒 Todos os dados são **anônimos e agregados**
- 🚫 **Sem coleta de dados pessoais** identificáveis
- 🎯 Foco exclusivo em **melhorar a ferramenta**

### ✅ O que NÃO coletamos

O Price Watcher **NÃO** coleta, armazena ou transmite **NENHUM** dos seguintes dados:
- ❌ Dados pessoais identificáveis (nome, CPF, e-mail, telefone)
- ❌ Endereço IP completo ou localização geográfica precisa
- ❌ Histórico de compras ou preferências de navegação
- ❌ Informações de pagamento ou cartão de crédito
- ❌ Senhas ou credenciais de login
- ❌ Dados de formulários ou campos de entrada sensíveis

### 📦 Como seus dados são armazenados

**PostgreSQL (Neon)** - Banco de dados serverless:
- ✅ Lista de favoritos (IDs dos produtos)
- ✅ Histórico de preços (timestamps + valores)
- ✅ Metadados dos produtos (nome, imagem)
- ✅ Grupos de produtos unificados
- ✅ Identificação anônima via **sessionId** (UUID gerado no navegador)

**localStorage/IndexedDB** - Cache local:
- ✅ SessionId (identificador único do dispositivo)
- ✅ Cache de dados para acesso offline
- ✅ Configurações do usuário

**Importante sobre privacidade**:
- 🔒 Não coletamos dados pessoais identificáveis
- 🆔 O sessionId é apenas um UUID aleatório - não pode ser usado para te identificar
- 🚫 Sem login ou autenticação - não precisa criar conta
- 🔐 Dados criptografados em trânsito (HTTPS) e em repouso
- ✅ Banco de dados acessível apenas pela aplicação
- 📤 Você pode exportar ou deletar todos os dados a qualquer momento

### 🛡️ Transparência Total

- 📖 Código 100% open-source - audite você mesmo!
- 🔍 Hospedagem: Vercel (LGPD/GDPR compliant)
- 🗄️ Banco: Neon PostgreSQL (serverless, seguro)
- 📊 Analytics anônimos: Vercel Analytics, Vercel Speed Insights e Microsoft Clarity (focados em UX)
- ✅ Conformidade com LGPD (Lei Geral de Proteção de Dados)

Para mais detalhes, leia nossa [Política de Privacidade](src/app/privacidade/page.tsx).

## 🌐 Como Funciona o Web Scraping

O Price Watcher utiliza técnicas de web scraping ético e responsável:

1. **Você fornece o identificador**: ID/URL do produto
2. **Requisição HTTP**: A aplicação faz uma requisição à página pública do produto
3. **Parsing HTML**: Usamos Cheerio para extrair apenas informações de preços
4. **Armazenamento local**: Os dados são salvos no seu navegador com timestamp
5. **Atualização periódica**: A cada 3 horas (apenas com aba aberta)

### ⚖️ Práticas Éticas

- ✅ Acessamos apenas páginas públicas
- ✅ Respeitamos robots.txt das lojas
- ✅ Não fazemos login ou acessamos áreas restritas
- ✅ Requisições feitas de forma responsável (delays entre requests, não sobrecarregamos servidores)
- ✅ Atualização automática com intervalo de 3 horas (respeitando rate limits)
- ✅ Dados usados apenas para fins educacionais e de pesquisa de preços

## ⚠️ Limitações e Considerações

- 🌐 Requer conexão com internet para consultar preços e sincronizar
- 🚫 Web scraping pode falhar se as lojas alterarem o HTML das páginas
- 🏪 Dependemos da estrutura HTML das lojas (KaBuM! e Amazon)
- 🔄 Cron job atualiza preços a cada 3 horas (não em tempo real)
- 💾 Banco de dados gratuito (Neon) tem limite de 5GB (suficiente para milhares de produtos)

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Este é um projeto open-source mantido pela comunidade.

### Como Contribuir

1. **Fork o projeto**
2. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/MinhaFeature
   ```
3. **Commit suas mudanças**
   ```bash
   git commit -m 'Adiciona MinhaFeature'
   ```
4. **Push para a branch**
   ```bash
   git push origin feature/MinhaFeature
   ```
5. **Abra um Pull Request**

### Ideias para Contribuições

- 🏪 Adicionar suporte para novas lojas (Magalu, Mercado Livre, etc.)
- 📧 Sistema de alertas por e-mail quando preço cair
- 📱 Versão PWA (Progressive Web App)
- 🌍 Internacionalização (i18n)
- 🎨 Temas customizáveis (dark mode, light mode)
- 📊 Mais métricas e análises estatísticas
- 🔔 Notificações push do navegador

## 🐛 Bugs e Sugestões

Encontrou um bug ou tem uma sugestão de melhoria?

- 🐞 **Reportar Bug**: [Abra uma issue](https://github.com/ooVictorFranco/price-watcher/issues/new?template=bug_report.md)
- 💡 **Sugerir Feature**: [Abra uma issue](https://github.com/ooVictorFranco/price-watcher/issues/new?template=feature_request.md)
- 💬 **Discussões**: [Participe das discussões](https://github.com/ooVictorFranco/price-watcher/discussions)

## 📝 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📊 Status do Projeto

🚀 **Em desenvolvimento ativo** - Novas funcionalidades sendo adicionadas regularmente!

Para ver o histórico completo de atualizações, visite nossa [página de changelog](/changelog).

## 🙏 Agradecimentos

- Comunidade Next.js e React
- Mantenedores do Cheerio
- Todos os contribuidores do projeto
- Usuários que reportam bugs e sugerem melhorias

## 📞 Contato

- **GitHub**: [@ooVictorFranco](https://github.com/ooVictorFranco)
- **Repositório**: [price-watcher](https://github.com/ooVictorFranco/price-watcher)
- **Issues**: [Reportar problemas](https://github.com/ooVictorFranco/price-watcher/issues)

---

<div align="center">

**Desenvolvido com ❤️ para ajudar consumidores a encontrarem os melhores preços durante a Black Friday e promoções sazonais.**

⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!

</div>
