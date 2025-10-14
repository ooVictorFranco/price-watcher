# Release Notes - v0.1.0-beta.6

**Data:** 2025-10-14

## Autocomplete Funcional com Cache Global

Esta versão corrige todos os problemas do autocomplete e garante que os dados sejam exibidos corretamente após a seleção de produtos.

---

## Correções Críticas

### 🐛 Fix: Histórico Vazio Após Carregamento

**Problema:**
- Ao clicar em uma sugestão do autocomplete, os preços apareciam mas desapareciam imediatamente
- Cards de preço mostravam "—" (vazio)
- Histórico exibia "Nenhum dado disponível"
- Dados "piscavam" na tela

**Causa Raiz:**
JavaScript considera array vazio `[]` como "truthy", então quando a API retornava `{ history: [] }` para produtos novos, o código fazia `setHistory([])` em vez de usar o fallback do localStorage.

**Solução:**
```typescript
// ANTES
setHistory(historyData.history || next);

// DEPOIS
const apiHistory = historyData.history || [];
setHistory(apiHistory.length > 0 ? apiHistory : next);
```

**Resultado:**
- ✅ Preços aparecem e permanecem visíveis
- ✅ Histórico é preservado do localStorage
- ✅ Sem "piscar" de dados
- ✅ Experiência suave

### 🐛 Fix: Timing ao Selecionar do Autocomplete

**Problema:**
- Ao clicar no autocomplete, aparecia erro "Forneça ?id=123456 ou ?url=..."
- Usuário precisava clicar em "Monitorar" novamente manualmente
- Estado do input não era atualizado a tempo

**Causa Raiz:**
React state updates são assíncronos. O `setTimeout` de 100ms não garantia que o estado fosse atualizado antes de chamar `onMonitor()`.

**Solução:**
```typescript
// ANTES
onChange(fullIdentifier);
setTimeout(() => onMonitor(), 100);

// DEPOIS
onChange(fullIdentifier);
onMonitor(fullIdentifier); // Passa valor diretamente
```

**Resultado:**
- ✅ Monitoramento instantâneo ao clicar no autocomplete
- ✅ Sem erros de validação
- ✅ UX perfeita

### 🐛 Fix: Prisma no Cliente

**Problema:**
- Erro: "PrismaClient is unable to run in this browser environment"
- App crashava ao tentar buscar histórico

**Causa Raiz:**
`mergeHistoryWithDatabase()` do `price-history.ts` usava Prisma diretamente e era chamado no componente cliente.

**Solução:**
- Substituído por chamada à API `/api/history`
- Prisma agora roda apenas no servidor
- Mantém fallback para localStorage

**Resultado:**
- ✅ Sem erros no console
- ✅ Histórico funciona corretamente
- ✅ Separação adequada cliente/servidor

---

## Melhorias

### 🔍 Logs de Debug Detalhados

Adicionados logs em toda a cadeia de execução para facilitar debugging:

```
[PAGE] startMonitoring called with: {...}
[PAGE] doFetch called with raw: 161471
[CACHE] ✓ Hit for 161471 (kabum)
[SCRAPE] Starting scrape for productId="161471"
[PAGE] Current snapshot: {...}
[PAGE] History from API: 1 items
```

**Benefícios:**
- Facilita identificar problemas
- Rastreamento completo do fluxo
- Debug mais rápido em produção

---

## Confirmações de Funcionalidade

### ✅ Cache Global Funcionando

**Busca de Produtos (`/api/products/search`):**
- Busca produtos de **qualquer usuário**
- Remove duplicatas automaticamente
- Ordena por mais recentes primeiro
- Limit de 10 resultados

**Cache de Preços (`/api/products/[id]`):**
- Usa `findFirst` sem filtrar por userId
- TTL de 60 minutos
- Compartilhado entre todos os usuários
- Fallback para scraping se stale

### ✅ Autocomplete Completo

**Funcionalidades:**
- ✅ Busca instantânea com debounce 300ms
- ✅ Sugestões com imagem, nome, provider e ID
- ✅ Highlight de termos de busca
- ✅ Click para monitorar automaticamente
- ✅ Mantém funcionalidade de colar ID/URL
- ✅ Cache colaborativo entre usuários
- ✅ Dados persistem corretamente

---

## Fluxo Completo Funcionando

### Cenário 1: Produto no Cache

```
1. Usuário digita "controle ps5"
2. Autocomplete mostra sugestões do cache
3. Usuário clica em uma sugestão
4. Sistema busca do cache (< 60min)
5. Preços aparecem instantaneamente ✅
6. Histórico do localStorage é exibido ✅
7. Histórico do banco é mesclado (se disponível) ✅
```

### Cenário 2: Produto Novo

```
1. Usuário cola ID/URL nova
2. Sistema faz scraping
3. Salva no banco (global)
4. Salva no localStorage (usuário)
5. Exibe preços ✅
6. Cria snapshot inicial ✅
7. Próximo usuário encontra no cache ✅
```

### Cenário 3: Cache Expirado

```
1. Usuário busca produto antigo (> 60min)
2. Cache detecta stale
3. Faz novo scraping
4. Atualiza banco (todos se beneficiam)
5. Exibe preços atualizados ✅
```

---

## Commits Incluídos

### feat: implementa busca inteligente com autocomplete colaborativo (d4996e7)
- API `/api/products/search`
- Componente `ProductAutocomplete`
- Integração com `SearchBar`
- Debounce, AbortController, Next.js Image

### fix: corrige erro ao selecionar produto do autocomplete (8bb94cc)
- Passa productId E provider para onSelect
- Constrói identificador válido automaticamente

### fix: corrige erro do Prisma no cliente e adiciona logs de debug (5589b17)
- Remove chamada direta do Prisma no cliente
- Usa API `/api/history` no servidor
- Adiciona logs [PAGE], [SCRAPE], [CACHE]

### fix: corrige timing ao selecionar produto do autocomplete (449c41c)
- onMonitor agora aceita parâmetro opcional
- Passa valor diretamente sem depender do estado
- Remove setTimeout desnecessário

### debug: adiciona logs detalhados para investigar dados vazios (8af7182)
- Logs em startMonitoring
- Logs em doFetch
- Logs em fetchProductWithCache

### fix: corrige histórico vazio após carregamento do autocomplete (9881064)
- Verifica length do array antes de usar
- Fallback para localStorage se API retornar vazio
- Garante que dados nunca são perdidos

---

## Breaking Changes

**Nenhuma** - Todas as mudanças são retrocompatíveis.

---

## Migração

**Não necessária** - O sistema continua funcionando sem alterações.

---

## Conhecidos Issues Resolvidos

- ✅ #1: Autocomplete causa erro ao clicar
- ✅ #2: Dados desaparecem após loading
- ✅ #3: Prisma no cliente crasha o app
- ✅ #4: Timing issue com setState

---

## Próximas Melhorias (Roadmap)

### v0.1.0-beta.7
- [ ] Navegação por teclado no autocomplete (↑↓ Enter Esc)
- [ ] Histórico de buscas recentes
- [ ] Filtro por provider no autocomplete
- [ ] Sugestões de busca populares
- [ ] Analytics de uso do autocomplete

### v0.2.0
- [ ] Notificações de queda de preço
- [ ] Comparação de preços entre lojas
- [ ] Wishlist compartilhável
- [ ] Alertas por email/push
- [ ] API pública

---

## Testes Realizados

### ✅ Funcionalidade
- [x] Autocomplete aparece ao digitar 2+ caracteres
- [x] Clique no autocomplete monitora produto
- [x] Preços aparecem corretamente
- [x] Histórico é preservado
- [x] Cache global funciona
- [x] Fallback para localStorage
- [x] Colar ID/URL continua funcionando

### ✅ Performance
- [x] Debounce reduz chamadas à API
- [x] AbortController cancela requests antigos
- [x] Next.js Image otimiza imagens
- [x] Build sem erros
- [x] TypeScript sem warnings

### ✅ Compatibilidade
- [x] Chrome 120+
- [x] Firefox 120+
- [x] Safari 17+
- [x] Edge 120+
- [x] Mobile (iOS/Android)

---

## Agradecimentos

Obrigado a todos que reportaram bugs e sugeriram melhorias!

---

**Versão:** v0.1.0-beta.6
**Data de Release:** 2025-10-14
**Breaking Changes:** Nenhuma
**Requer Migração:** Não

**Desenvolvido com:** Next.js 15, Prisma, PostgreSQL, Framer Motion, TypeScript
**Ferramentas:** Claude Code, ESLint, Tailwind CSS, Turbopack
