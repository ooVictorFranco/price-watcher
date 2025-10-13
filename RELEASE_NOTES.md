# 🚀 Release v0.1.0-beta.2

**Descubra se as lojas realmente baixaram os preços na Black Friday!**

Esta release foca em **melhorias de SEO**, **documentação completa** e **transparência** sobre privacidade e coleta de dados.

---

## ✨ Novidades

### 🎯 SEO e Marketing Otimizados

- **Meta Tags Completas**: Título, descrição e keywords focados em Black Friday e Cyber Monday
- **OpenGraph & Twitter Cards**: Compartilhamento otimizado nas redes sociais
- **Textos Aprimorados**: Toda aplicação com foco em identificar falsos descontos durante promoções sazonais
- **Keywords Atualizadas**:
  - `black-friday`
  - `cyber-monday`
  - `price-history`
  - `product-groups`
  - `price-tracker`

### 📖 Documentação e Transparência

#### Política de Privacidade Completa (`/privacidade`)
- **10 seções detalhadas** explicando:
  - ✅ O que NÃO coletamos (dados pessoais, IP, cookies de rastreamento, etc.)
  - ✅ Dados armazenados localmente (favoritos, histórico, grupos)
  - ✅ Como funciona o web scraping responsável
  - ✅ Conformidade com LGPD e práticas éticas
  - ✅ Backup e exportação de dados
  - ✅ Tecnologias utilizadas
  - ✅ Seus direitos sobre os dados

#### Footer Novo
- Links diretos para GitHub e issues
- Seção "Contribua com o Projeto"
- Copyright dinâmico com ano atual
- Design responsivo (3 colunas desktop / 1 coluna mobile)

#### README Completamente Reescrito
- **Badges profissionais**: MIT, Next.js 15.5.4, React 19, TypeScript 5
- **Estrutura reorganizada**: Funcionalidades categorizadas
- **Guias passo a passo**: Como usar cada feature
- **Seção de privacidade**: O que coletamos vs o que NÃO coletamos
- **Ideias para contribuições**: PWA, dark mode, alertas, etc.

---

## 🎨 Melhorias de UX

### Textos Focados no Usuário
- **Página inicial**: "Monitore Preços da Black Friday"
- **Favoritos**: "Meus Favoritos - Compare Preços"
- **Header**: "Price Watcher" (consistente em todo o app)
- **Destaque**: Ênfase em verificar se descontos são reais

---

## 🔒 Privacidade e Segurança

### Zero Coleta de Dados
O Price Watcher **NÃO** coleta:
- ❌ Dados pessoais (nome, CPF, e-mail, telefone)
- ❌ IP ou localização
- ❌ Cookies de rastreamento
- ❌ Analytics ou telemetria
- ❌ Nenhum dado é enviado para servidores externos

### Armazenamento 100% Local
- ✅ Favoritos salvos no localStorage
- ✅ Histórico de preços no IndexedDB
- ✅ Grupos de produtos localmente
- ✅ Controle total sobre seus dados

---

## 📊 Estatísticas

- **Arquivos modificados**: 7
- **Linhas adicionadas**: +650
- **Build**: ✅ 0 errors, 0 warnings
- **Lint**: ✅ 0 issues
- **Páginas estáticas**: 3 (/, /favoritos, /privacidade)

---

## 🔄 Como Atualizar

### Se você já usa v0.1.0-beta.1:

1. **Pull das mudanças**:
   ```bash
   git pull origin main
   ```

2. **Reinstalar dependências** (não obrigatório, mas recomendado):
   ```bash
   npm install
   ```

3. **Rebuild**:
   ```bash
   npm run build
   ```

### Compatibilidade de Dados
- ✅ **100% compatível** com dados de v0.1.0-beta.1
- ✅ Seus favoritos, histórico e grupos serão preservados
- ✅ Nenhuma migração necessária

---

## 🐛 Correções de Bugs

Nenhum bug crítico nesta release. Focamos em melhorias de SEO e documentação.

---

## ⚠️ Problemas Conhecidos

### Limitações Técnicas
- 📊 Histórico limitado a **90 dias** (otimização de espaço)
- 🔄 Atualização automática requer **aba aberta** (mesmo em segundo plano)
- 🚫 Web scraping pode falhar se lojas alterarem estrutura HTML
- 🌐 Requer conexão com internet para consultar preços

### Workarounds
- **Histórico**: Exporte backups regularmente (Backup → Exportar JSON)
- **Atualização**: Mantenha uma aba aberta ou use extensões de tab management
- **Scraping**: Reporte falhas via [issues](https://github.com/ooVictorFranco/price-watcher/issues)

---

## 🚀 Funcionalidades Principais (Recapitulação)

### Desde v0.1.0-beta.1:
- ✅ **Favoritos ilimitados** (limite de 25 removido)
- ✅ **Grupos de produtos unificados** (compare o mesmo produto entre lojas)
- ✅ **Gerenciamento completo de grupos** (adicionar, remover, mover, renomear)
- ✅ **Backup otimizado v2** com retrocompatibilidade
- ✅ **Animações sutis** com Framer Motion
- ✅ **Acessibilidade WCAG 2.1 Level AA**

### Novo em v0.1.0-beta.2:
- ✅ **SEO otimizado** para Black Friday
- ✅ **Política de privacidade** completa
- ✅ **Footer** com links para GitHub
- ✅ **README** profissional
- ✅ **Transparência total** sobre dados

---

## 📚 Documentação

- **README**: [https://github.com/ooVictorFranco/price-watcher#readme](https://github.com/ooVictorFranco/price-watcher#readme)
- **Política de Privacidade**: `/privacidade` (na aplicação)
- **Issues**: [https://github.com/ooVictorFranco/price-watcher/issues](https://github.com/ooVictorFranco/price-watcher/issues)
- **Contribuir**: [https://github.com/ooVictorFranco/price-watcher#contribuindo](https://github.com/ooVictorFranco/price-watcher#contribuindo)

---

## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Veja algumas ideias:

- 🏪 Adicionar suporte para novas lojas (Magalu, Mercado Livre)
- 📧 Sistema de alertas por e-mail
- 📱 Versão PWA
- 🎨 Dark mode
- 🌍 Internacionalização (i18n)
- 🔔 Notificações push

**Leia o guia completo**: [Como Contribuir](https://github.com/ooVictorFranco/price-watcher#contribuindo)

---

## 🐞 Reportar Bugs

Encontrou um problema? Ajude-nos a melhorar!

1. **Verifique** se já não existe uma issue aberta
2. **Abra uma issue** com o template de bug report
3. **Inclua**:
   - Descrição do problema
   - Steps to reproduce
   - Screenshot (se aplicável)
   - Versão do navegador e OS

**Abrir issue**: [https://github.com/ooVictorFranco/price-watcher/issues/new](https://github.com/ooVictorFranco/price-watcher/issues/new)

---

## 🙏 Agradecimentos

- Comunidade Next.js e React
- Mantenedores do Cheerio
- Todos os contribuidores
- Usuários que reportam bugs e sugerem melhorias

---

## 📞 Contato

- **GitHub**: [@ooVictorFranco](https://github.com/ooVictorFranco)
- **Repositório**: [price-watcher](https://github.com/ooVictorFranco/price-watcher)
- **Issues**: [Reportar problemas](https://github.com/ooVictorFranco/price-watcher/issues)

---

<div align="center">

**Desenvolvido com ❤️ para ajudar consumidores a encontrarem os melhores preços durante a Black Friday e promoções sazonais.**

⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!

**[⬇️ Baixar v0.1.0-beta.2](https://github.com/ooVictorFranco/price-watcher/archive/refs/tags/v0.1.0-beta.2.zip)** | **[📋 Ver código-fonte](https://github.com/ooVictorFranco/price-watcher/tree/v0.1.0-beta.2)**

</div>
