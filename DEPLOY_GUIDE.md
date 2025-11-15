# 🚀 Guia de Deploy - Price Watcher

## Deploy via CLI Vercel

### 1. Fazer login na Vercel

```bash
vercel login
```

Isso abrirá seu navegador para autenticação.

### 2. Configurar o banco de dados PostgreSQL

**Opção A: Via Dashboard Vercel (Recomendado)**
1. Acesse https://vercel.com/dashboard
2. Vá em **Storage** → **Create Database** → **Neon (Postgres)**
3. Copie as variáveis de ambiente `POSTGRES_URL` e `POSTGRES_URL_NON_POOLING`

**Opção B: Usar Neon diretamente**
1. Acesse https://neon.tech/
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a connection string

### 3. Adicionar variáveis de ambiente

Execute localmente ou adicione no Dashboard da Vercel:

```bash
# Via CLI (durante o deploy)
vercel env add POSTGRES_URL
vercel env add POSTGRES_URL_NON_POOLING
vercel env add CRON_SECRET
```

Ou adicione manualmente no Dashboard:
- **Settings** → **Environment Variables**
- Adicione as 3 variáveis acima

**CRON_SECRET**: Pode ser qualquer UUID. Gere um em https://www.uuidgenerator.net/

### 4. Fazer o deploy

```bash
# Deploy de produção
vercel --prod
```

### 5. Sincronizar o banco de dados

Após o primeiro deploy, você precisa criar as tabelas:

**Opção A: Via terminal local**
```bash
# Configure as variáveis de ambiente localmente
echo 'POSTGRES_URL="sua-connection-string"' > .env.local
echo 'POSTGRES_URL_NON_POOLING="sua-connection-string-non-pooling"' >> .env.local

# Gere o Prisma Client
npx prisma generate

# Sincronize o schema com o banco
npx prisma db push
```

**Opção B: Via Vercel CLI**
```bash
# Execute remotamente
vercel env pull .env.local
npx prisma db push
```

### 6. Verificar o funcionamento

1. Acesse sua aplicação no domínio fornecido pela Vercel
2. Adicione um produto aos favoritos
3. Teste o cron job manualmente:

```bash
curl -X GET "https://seu-app.vercel.app/api/cron/update-prices" \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

---

## Deploy via Git Integration (Automático)

### 1. Conecte o repositório à Vercel

1. Acesse https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione `ooVictorFranco/price-watcher`
4. Configure as variáveis de ambiente:
   - `POSTGRES_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `CRON_SECRET`
5. Clique em "Deploy"

### 2. A cada push no branch `main`

A Vercel fará deploy automaticamente!

---

## Checklist Pós-Deploy

- [ ] Banco de dados PostgreSQL criado
- [ ] Variáveis de ambiente configuradas (POSTGRES_URL, POSTGRES_URL_NON_POOLING, CRON_SECRET)
- [ ] Deploy realizado com sucesso
- [ ] Comando `npx prisma db push` executado
- [ ] Aplicação acessível no domínio da Vercel
- [ ] Cron jobs configurados (verificar em vercel.json)
- [ ] Teste de adição de produto funcionando
- [ ] Teste de atualização automática de preços funcionando

---

## Solução de Problemas

### Erro: "PrismaClient is unable to run in this browser environment"

Execute:
```bash
npx prisma generate
```

### Erro: "Database connection failed"

Verifique se as variáveis `POSTGRES_URL` e `POSTGRES_URL_NON_POOLING` estão corretas.

### Cron job não está executando

1. Verifique se o `vercel.json` está no repositório
2. Verifique se a variável `CRON_SECRET` está configurada
3. O cron job só funciona em produção, não em preview/development

### Build falhou

1. Verifique se o Node.js 22.x está configurado
2. Rode `npm run build` localmente para ver os erros
3. Verifique os logs de build no Dashboard da Vercel

---

## Recursos Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Neon](https://neon.tech/docs)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
