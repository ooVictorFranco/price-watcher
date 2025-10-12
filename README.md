# 🛒 KaBum Price Watcher

Monitor inteligente de preços para **KaBum!** e **Amazon**, com histórico, comparação e atualização automática em segundo plano.

## 📋 Sobre o Projeto

**KaBum Price Watcher** é uma aplicação web que permite monitorar preços de produtos do KaBum! e Amazon, mantendo um histórico completo de variações e oferecendo recursos de comparação entre produtos.

### ✨ Principais Funcionalidades

- 🔍 **Monitoramento de Preços**: Acompanhe produtos do KaBum! (ID ou URL) e Amazon (ASIN ou URL)
- 📊 **Histórico Visual**: Gráficos interativos mostrando a evolução dos preços (à vista, parcelado e original)
- ⭐ **Favoritos**: Salve até 25 produtos para acompanhamento rápido
- 🔄 **Atualização Automática**: Consulta preços a cada 3 horas enquanto a aplicação estiver aberta
- 📈 **Comparação**: Compare até 3 produtos lado a lado com gráficos unificados
- 💾 **Backup e Sincronização**: Exporte/importe dados ou use "arquivo vivo" para backup automático
- 🌐 **Suporte Multi-loja**: KaBum! e Amazon em uma única plataforma
- 📱 **Responsivo**: Interface otimizada para desktop e mobile

### 🎯 Dados Monitorados

Para cada produto, o sistema rastreia:
- ✅ Preço à vista
- ✅ Preço parcelado
- ✅ Preço original (de/por)
- ✅ Desconto percentual
- ✅ Histórico de variações (últimos 90 dias)
- ✅ Timestamp de última atualização

## 🚀 Tecnologias

Este projeto foi desenvolvido com:

- [Next.js 15.5.4](https://nextjs.org/) com Turbopack
- [React 19](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) - Animações
- [Chart.js](https://www.chartjs.org/) - Gráficos
- [Cheerio](https://cheerio.js.org/) - Web scraping
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - Armazenamento local
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) - Arquivo vivo

## 📦 Instalação

### Pré-requisitos

- Node.js 20.x ou superior
- npm, yarn, pnpm ou bun

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/kabum-price-watcher.git
   cd kabum-price-watcher
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Configure as variáveis de ambiente** (opcional)

   Crie um arquivo `.env.local` na raiz do projeto se necessário:
   ```env
   # Adicione variáveis de ambiente aqui, se necessário
   ```

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
# Desenvolvimento com hot-reload
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm run start

# Executar linter
npm run lint
```

## 📖 Como Usar

### 1. Monitorar um Produto

Na página **Monitoramento**:
- Cole o ID do KaBum! (ex: `922662`)
- Ou cole a URL completa do produto (ex: `https://www.kabum.com.br/produto/922662`)
- Ou cole o ASIN da Amazon (ex: `B0F7Z9F9SD`)
- Ou cole a URL da Amazon (incluindo links encurtados `a.co` e `amzn.to`)

### 2. Adicionar aos Favoritos

- Clique no botão **⭐ Favoritar** no produto monitorado
- Limite: 25 produtos favoritos

### 3. Comparar Produtos

Na página **Favoritos & Comparar**:
- Selecione os checkboxes de 2 a 3 produtos
- Clique em **Comparar selecionados**
- Escolha a métrica (À vista, Parcelado ou Original)
- Visualize o gráfico unificado

### 4. Backup e Arquivo Vivo

**Exportar/Importar:**
- Menu **Backup** → **Exportar JSON**: Salva todos os dados
- Menu **Backup** → **Importar JSON**: Mescla dados importados com os existentes

**Arquivo Vivo (Chrome/Edge):**
- Menu **Backup** → **Vincular arquivo (nativo)**
- Escolha um arquivo `.json` que será atualizado automaticamente

**Modo Compatível (Firefox/Safari):**
- Menu **Backup** → **Ativar modo compatível**
- Receba lembretes para salvar quando houver alterações

## 🏗️ Estrutura do Projeto

```
kabum-price-watcher/
├── src/
│   ├── app/                      # Páginas Next.js (App Router)
│   │   ├── layout.tsx            # Layout raiz
│   │   ├── page.tsx              # Página de monitoramento
│   │   ├── favoritos/            # Página de favoritos e comparação
│   │   └── api/                  # API Routes para scraping
│   ├── components/               # Componentes React
│   │   ├── FavoritesList.tsx     # Lista de favoritos
│   │   ├── ComparePanel.tsx      # Painel de comparação
│   │   ├── BackupMenu.tsx        # Menu de backup
│   │   └── ...
│   ├── lib/                      # Utilitários e lógica de negócio
│   │   ├── utils.ts              # Funções auxiliares
│   │   ├── backup.ts             # Sistema de backup
│   │   ├── livefile.ts           # Arquivo vivo
│   │   ├── background.ts         # Atualização em segundo plano
│   │   └── parseKabum.ts         # Parser de HTML
│   └── types/                    # Definições TypeScript
├── public/                       # Arquivos estáticos
├── package.json                  # Dependências
├── tsconfig.json                 # Configuração TypeScript
└── tailwind.config.ts            # Configuração Tailwind

```

## 🔒 Privacidade e Armazenamento

- ✅ **100% Local**: Todos os dados são armazenados no navegador (localStorage + IndexedDB)
- ✅ **Sem Backend**: Não enviamos dados para servidores externos
- ✅ **Sem Cookies de Rastreamento**: Apenas localStorage para funcionalidade
- ⚠️ **Cuidado ao limpar cache**: Faça backup antes de limpar dados do navegador

## ⚠️ Limitações e Considerações

- 📊 Histórico mantém apenas os últimos **90 dias**
- ⭐ Máximo de **25 produtos** nos favoritos
- 🔄 Atualização automática ocorre apenas com a aplicação aberta
- 🌐 Requer conexão com internet para consultar preços
- 🚫 Web scraping pode falhar se as lojas alterarem o HTML

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🐛 Bugs e Sugestões

Encontrou um bug ou tem uma sugestão? Abra uma [issue](https://github.com/seu-usuario/kabum-price-watcher/issues) no GitHub!

---

Desenvolvido com ❤️ para ajudar a encontrar as melhores ofertas no KaBum! e Amazon.
