# Setup Rápido - Sistema de Histórico de Preços

## 1. Configurar Variável de Ambiente

Adicione no `.env.local`:

```bash
# Cron Secret (gere um UUID ou use: openssl rand -hex 32)
CRON_SECRET=seu-uuid-secreto-aqui
```

Para gerar um secret seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 2. Executar Migrations do Prisma

O schema já está pronto com o modelo `PriceSnapshot`. Se você ainda não rodou as migrations:

```bash
# Gerar o Prisma Client
npx prisma generate

# Aplicar migrations (se necessário)
npx prisma db push

# Ou criar uma nova migration
npx prisma migrate dev --name add-price-history
```

## 3. Verificar Estrutura do Banco

```bash
# Abrir Prisma Studio para visualizar os dados
npx prisma studio
```

Verifique se a tabela `PriceSnapshot` foi criada com os campos:
- id
- productId
- timestamp
- priceVista
- priceParcelado
- priceOriginal
- installmentsCount
- installmentsValue
- source

## 4. Testar Localmente

### 4.1 Testar Salvamento de Histórico

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse `http://localhost:3000`

3. Busque um produto (ex: ID 922662 do KaBuM)

4. Verifique no console do navegador se não há erros

5. Abra o Prisma Studio e verifique se foram criados registros em `PriceSnapshot`

### 4.2 Testar Filtros de Período

1. Busque um produto com histórico

2. No gráfico de histórico, clique nos botões de filtro:
   - Hoje
   - 3 dias
   - 1 semana
   - 1 mês
   - 3 meses
   - 6 meses

3. Verifique se o gráfico atualiza corretamente

### 4.3 Testar Seed de Histórico Local

1. Limpe o banco de dados (opcional):
```bash
npx prisma db push --force-reset
```

2. Crie histórico no localStorage:
   - Busque um produto várias vezes (com intervalos)
   - Ou simule histórico antigo no localStorage

3. Recarregue a página e busque o mesmo produto

4. Verifique no Prisma Studio se o histórico foi migrado para o banco

## 5. Configurar na Vercel

### 5.1 Adicionar Variável de Ambiente

1. Acesse o dashboard da Vercel
2. Vá em Settings → Environment Variables
3. Adicione:
   - **Key**: `CRON_SECRET`
   - **Value**: seu secret gerado
   - **Environments**: Production, Preview, Development

### 5.2 Verificar Cron Jobs

O `vercel.json` já está configurado com:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-prices",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/cleanup-old-prices",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Após o deploy, os cron jobs serão executados automaticamente.

### 5.3 Testar Cron Jobs Manualmente

```bash
# Update Prices
curl -X GET https://seu-app.vercel.app/api/cron/update-prices \
  -H "Authorization: Bearer SEU_CRON_SECRET"

# Cleanup Old Prices
curl -X GET https://seu-app.vercel.app/api/cron/cleanup-old-prices \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

## 6. Verificar Funcionamento

### 6.1 Logs da Vercel

1. Dashboard → Seu projeto → Functions
2. Clique em qualquer função (ex: `/api/cron/update-prices`)
3. Veja os logs de execução

### 6.2 Verificar Banco de Dados

```bash
# Conectar ao banco de produção
npx prisma studio --browser none

# Ou usar SQL direto
psql $POSTGRES_URL
```

Queries úteis:

```sql
-- Total de snapshots
SELECT COUNT(*) FROM "PriceSnapshot";

-- Snapshots por produto
SELECT p.name, COUNT(ps.id) as snapshots
FROM "Product" p
LEFT JOIN "PriceSnapshot" ps ON p.id = ps."productId"
GROUP BY p.id, p.name
ORDER BY snapshots DESC
LIMIT 10;

-- Snapshots mais recentes
SELECT p.name, ps.timestamp, ps."priceVista", ps.source
FROM "PriceSnapshot" ps
JOIN "Product" p ON ps."productId" = p.id
ORDER BY ps.timestamp DESC
LIMIT 20;

-- Snapshots mais antigos (devem ter no máximo 180 dias)
SELECT MIN(timestamp) as oldest, MAX(timestamp) as newest,
       EXTRACT(DAY FROM (NOW() - MIN(timestamp))) as days_old
FROM "PriceSnapshot";
```

## 7. Troubleshooting

### Erro: "CRON_SECRET não definido"

**Solução**: Adicione `CRON_SECRET` no `.env.local` localmente e na Vercel para produção.

### Erro: "Product not found"

**Solução**: O produto precisa estar salvo na tabela `Product` antes de salvar snapshots. Certifique-se de que a API `/api/favorites/sync` está sendo chamada.

### Erro: "Failed to save snapshot"

**Solução**:
1. Verifique a conexão com o banco de dados
2. Verifique se as migrations foram aplicadas
3. Veja os logs do servidor para mais detalhes

### Histórico não aparece no gráfico

**Solução**:
1. Abra o DevTools → Network
2. Verifique se a chamada para `/api/history` retorna dados
3. Verifique se o período selecionado contém dados
4. Tente mudar o filtro de período

### Cron job não executa

**Solução**:
1. Verifique se o deploy foi feito com sucesso
2. Verifique se `CRON_SECRET` está configurado na Vercel
3. Os cron jobs só funcionam em produção, não em preview ou development
4. Teste manualmente com curl

## 8. Monitoramento

### 8.1 Criar Alertas (Opcional)

Na Vercel, configure alertas para:
- Falhas de função
- Timeout de função
- Erros de cron job

### 8.2 Dashboard de Métricas

Crie queries para monitorar:

```sql
-- Crescimento de dados por dia
SELECT DATE(timestamp) as date, COUNT(*) as snapshots
FROM "PriceSnapshot"
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Taxa de sucesso do cron
SELECT
  source,
  COUNT(*) as total,
  DATE(timestamp) as date
FROM "PriceSnapshot"
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY source, DATE(timestamp)
ORDER BY date DESC;
```

## 9. Próximos Passos

Após configurar o sistema de histórico:

1. ✅ Monitore os primeiros dias para garantir que os cron jobs estão funcionando
2. ✅ Verifique se o cleanup está removendo dados antigos corretamente
3. ✅ Teste a experiência do usuário com os filtros de período
4. ✅ Considere adicionar notificações de queda de preço
5. ✅ Implemente análises de tendências de preços

## 10. Recursos Adicionais

- 📚 [Documentação Completa](./PRICE_HISTORY_SYSTEM.md)
- 📊 [Schema do Prisma](./prisma/schema.prisma)
- 🔧 [APIs de Histórico](./src/app/api/history/)
- 🎨 [Componentes de Gráfico](./src/components/)

---

**Dúvidas?** Consulte a documentação completa em `PRICE_HISTORY_SYSTEM.md`
