# Configuração do Banco de Dados (Vercel Postgres)

Este guia explica como configurar o banco de dados PostgreSQL na Vercel para habilitar a atualização automática de preços.

## Por que usar banco de dados?

Com o banco de dados e cron jobs, o sistema consegue:
- ✅ Atualizar preços automaticamente **mesmo com o navegador fechado**
- ✅ Sincronizar dados entre múltiplos dispositivos
- ✅ Manter histórico completo de preços de forma confiável
- ✅ Executar scraping a cada 3 horas automaticamente

---

## Passo 1: Criar o Banco de Dados na Vercel

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto **price-watcher**
3. Vá em **Storage** → **Create Database**
4. Escolha **Neon (Postgres)** ou **Vercel Postgres**
5. Clique em **Create**

A Vercel vai automaticamente:
- Criar o banco de dados
- Adicionar as variáveis de ambiente `POSTGRES_URL` e `POSTGRES_URL_NON_POOLING`

---

## Passo 2: Configurar Variáveis de Ambiente Locais

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```

2. No Dashboard da Vercel, vá em **Settings** → **Environment Variables**

3. Copie os valores de:
   - `POSTGRES_URL`
   - `POSTGRES_URL_NON_POOLING`

4. Cole no seu `.env.local`

5. Adicione também uma secret para o cron job:
```bash
CRON_SECRET=sua-chave-secreta-aqui-use-um-uuid
```

6. Adicione `CRON_SECRET` também nas Environment Variables da Vercel

---

## Passo 3: Executar Migrations do Prisma

Execute os comandos para criar as tabelas no banco:

```bash
# Gera o cliente Prisma
npx prisma generate

# Cria as tabelas no banco de dados
npx prisma db push

# (Opcional) Visualiza o banco de dados
npx prisma studio
```

---

## Passo 4: Deploy na Vercel

```bash
git add .
git commit -m "feat: adiciona backend com Postgres e cron jobs"
git push origin main
```

A Vercel vai automaticamente:
- Detectar o `vercel.json` com a configuração do cron
- Configurar o cron job para rodar a cada 3 horas
- Fazer deploy da aplicação

---

## Passo 5: Verificar se está Funcionando

### Verificar Cron Job

1. No Dashboard da Vercel, vá em **Cron Jobs**
2. Você deve ver: `/api/cron/update-prices` configurado para `0 */3 * * *`
3. Aguarde a próxima execução ou teste manualmente:

```bash
curl -X GET "https://seu-app.vercel.app/api/cron/update-prices" \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

### Verificar Logs

1. Vá em **Deployments** → Clique no deployment mais recente
2. Clique em **Functions** → `/api/cron/update-prices`
3. Visualize os logs de execução

---

## Como Funciona

### Fluxo de Dados

1. **Usuário adiciona produto aos favoritos**
   - Frontend chama `POST /api/favorites`
   - Dados são salvos no PostgreSQL

2. **Cron Job executa a cada 3 horas**
   - Vercel chama automaticamente `GET /api/cron/update-prices`
   - Endpoint busca todos os produtos desatualizados
   - Faz scraping das lojas (KaBuM/Amazon)
   - Salva novos snapshots de preço no banco

3. **Usuário visualiza dados atualizados**
   - Frontend chama `GET /api/favorites`
   - Recebe produtos + histórico de preços atualizado

### Migração Automática

Na primeira vez que o usuário acessar a aplicação após o deploy:
- O componente `<DataMigration />` detecta dados no localStorage
- Migra automaticamente favoritos e histórico para o banco de dados
- Marca migração como concluída

---

## Comandos Úteis

```bash
# Visualizar schema do banco
npx prisma studio

# Resetar banco de dados (CUIDADO: apaga todos os dados)
npx prisma db push --force-reset

# Ver logs do cron
vercel logs --follow

# Testar endpoint localmente
npm run dev
curl -X POST http://localhost:3000/api/favorites \
  -H "Content-Type: application/json" \
  -H "x-session-id: test-session" \
  -d '{"productId":"123","provider":"kabum","name":"Produto Teste","image":null}'
```

---

## Solução de Problemas

### Erro: "Cannot find module '@prisma/client'"

```bash
npx prisma generate
```

### Erro: "POSTGRES_URL is not defined"

Certifique-se de que:
1. As variáveis estão no `.env.local` (desenvolvimento)
2. As variáveis estão nas Environment Variables da Vercel (produção)

### Cron não está executando

1. Verifique se `vercel.json` está no root do projeto
2. Verifique se fez deploy após criar o arquivo
3. Aguarde até 10 minutos após o deploy

### Rate Limiting / Scraping bloqueado

O cron job já tem delays de 2 segundos entre requests. Se necessário:
- Aumente o delay em `src/app/api/cron/update-prices/route.ts`
- Reduza o `take: 50` para processar menos produtos por execução

---

## Estrutura do Banco de Dados

### Tabelas

- **User**: Usuários identificados por sessionId
- **Product**: Produtos favoritados pelos usuários
- **PriceSnapshot**: Histórico de preços de cada produto
- **ProductGroup**: Grupos para comparação entre lojas

### Relações

```
User (1) ──→ (N) Product
User (1) ──→ (N) ProductGroup
Product (N) ──→ (1) ProductGroup
Product (1) ──→ (N) PriceSnapshot
```

---

## Custos

### Vercel Postgres (Neon) - Free Tier

- ✅ 5GB de storage
- ✅ 100 horas de computação/mês
- ✅ Suficiente para milhares de produtos

### Cron Jobs na Vercel

- ✅ Incluído no plano gratuito
- ✅ Sem limites de execuções

**Resultado**: 100% gratuito para uso pessoal! 🎉

---

## Próximos Passos

Após configurar o banco:

1. ✅ Os preços serão atualizados automaticamente
2. ✅ Dados sincronizados entre dispositivos
3. ✅ Histórico preservado de forma confiável

Aproveite o monitoramento automático! 🚀
