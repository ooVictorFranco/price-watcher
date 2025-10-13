# Início Rápido - Banco de Dados

## TL;DR - 5 minutos para configurar

### 1. Criar banco na Vercel
```
Dashboard → Storage → Create Database → Neon (Postgres)
```

### 2. Configurar localmente
```bash
# Copiar variáveis de ambiente
cp .env.example .env.local

# Adicionar no .env.local (pegar do dashboard da Vercel):
POSTGRES_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
CRON_SECRET="qualquer-uuid-aqui"

# Gerar cliente Prisma
npx prisma generate

# Criar tabelas no banco
npx prisma db push
```

### 3. Deploy
```bash
# Adicionar CRON_SECRET nas Environment Variables da Vercel
# Dashboard → Settings → Environment Variables

git add .
git commit -m "feat: adiciona backend com atualização automática"
git push origin main
```

### 4. Pronto!
- ✅ Preços atualizados automaticamente a cada 3 horas
- ✅ Dados sincronizados entre dispositivos
- ✅ Funciona mesmo com navegador fechado

---

## Verificar se está funcionando

1. Adicione um produto aos favoritos
2. Aguarde 3 horas (ou teste o endpoint manualmente)
3. Veja o histórico atualizado no gráfico

Para testar manualmente:
```bash
curl -X GET "https://seu-app.vercel.app/api/cron/update-prices" \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

---

## Arquivos Criados

- `prisma/schema.prisma` - Schema do banco de dados
- `src/lib/prisma.ts` - Cliente Prisma
- `src/lib/session.ts` - Gerenciamento de sessão
- `src/lib/sync.ts` - Migração de dados
- `src/app/api/favorites/route.ts` - CRUD de favoritos
- `src/app/api/prices/update/route.ts` - Atualização manual de preços
- `src/app/api/cron/update-prices/route.ts` - Cron job (executado pela Vercel)
- `src/components/DataMigration.tsx` - Migração automática do localStorage
- `vercel.json` - Configuração do cron job

---

## Documentação Completa

Para mais detalhes, veja: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
