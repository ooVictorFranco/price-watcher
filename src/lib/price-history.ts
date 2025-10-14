// src/lib/price-history.ts
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/session-server';

/**
 * Salva um snapshot de preço no banco de dados
 */
export async function savePriceSnapshot(
  sessionId: string,
  productId: string,
  provider: string,
  data: {
    priceVista: number | null;
    priceParcelado: number | null;
    priceOriginal: number | null;
    installmentsCount?: number | null;
    installmentsValue?: number | null;
    source?: 'manual' | 'scheduled' | 'auto';
  }
) {
  try {
    const user = await getOrCreateUser(sessionId);

    // Busca o produto
    const product = await prisma.product.findUnique({
      where: {
        userId_productId_provider: {
          userId: user.id,
          productId,
          provider,
        },
      },
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Cria o snapshot
    await prisma.priceSnapshot.create({
      data: {
        productId: product.id,
        priceVista: data.priceVista,
        priceParcelado: data.priceParcelado,
        priceOriginal: data.priceOriginal,
        installmentsCount: data.installmentsCount,
        installmentsValue: data.installmentsValue,
        source: data.source || 'manual',
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar snapshot de preço:', error);
    throw error;
  }
}

/**
 * Busca histórico de preços do banco com período
 */
export async function getPriceHistory(
  sessionId: string,
  productId: string,
  provider: string,
  period: 'today' | '3days' | '1week' | '1month' | '3months' | '6months' = '6months'
) {
  try {
    const user = await getOrCreateUser(sessionId);

    const product = await prisma.product.findUnique({
      where: {
        userId_productId_provider: {
          userId: user.id,
          productId,
          provider,
        },
      },
    });

    if (!product) {
      return [];
    }

    const now = new Date();
    const startDate = new Date(now);

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '3days':
        startDate.setDate(now.getDate() - 3);
        break;
      case '1week':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
    }

    const snapshots = await prisma.priceSnapshot.findMany({
      where: {
        productId: product.id,
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      select: {
        timestamp: true,
        priceVista: true,
        priceParcelado: true,
        priceOriginal: true,
      },
    });

    return snapshots.map(snap => ({
      timestamp: snap.timestamp.getTime(),
      priceVista: snap.priceVista,
      priceParcelado: snap.priceParcelado,
      priceOriginal: snap.priceOriginal,
    }));
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
}

/**
 * Mescla histórico do localStorage com histórico do banco
 * Prioriza dados do banco, mas mantém dados locais se mais recentes
 */
export async function mergeHistoryWithDatabase(
  sessionId: string,
  productId: string,
  provider: string,
  localHistory: Array<{
    timestamp: number;
    priceVista: number | null;
    priceParcelado: number | null;
    priceOriginal: number | null;
  }>,
  period: 'today' | '3days' | '1week' | '1month' | '3months' | '6months' = '6months'
) {
  try {
    // Busca histórico do banco
    const dbHistory = await getPriceHistory(sessionId, productId, provider, period);

    // Cria um mapa por timestamp para evitar duplicatas
    const historyMap = new Map<number, typeof localHistory[0]>();

    // Adiciona histórico do banco (prioridade)
    dbHistory.forEach(item => {
      historyMap.set(item.timestamp, item);
    });

    // Adiciona histórico local apenas se não existir no banco
    localHistory.forEach(item => {
      if (!historyMap.has(item.timestamp)) {
        historyMap.set(item.timestamp, item);
      }
    });

    // Converte de volta para array e ordena
    const merged = Array.from(historyMap.values()).sort((a, b) => a.timestamp - b.timestamp);

    return merged;
  } catch (error) {
    console.error('Erro ao mesclar históricos:', error);
    return localHistory;
  }
}

/**
 * Seed de histórico: migra dados do localStorage para o banco
 */
export async function seedPriceHistoryFromLocal(
  sessionId: string,
  productId: string,
  provider: string,
  localHistory: Array<{
    timestamp: number;
    priceVista: number | null;
    priceParcelado: number | null;
    priceOriginal: number | null;
  }>
) {
  try {
    if (!localHistory || localHistory.length === 0) {
      return { success: true, count: 0 };
    }

    const user = await getOrCreateUser(sessionId);

    const product = await prisma.product.findUnique({
      where: {
        userId_productId_provider: {
          userId: user.id,
          productId,
          provider,
        },
      },
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Busca timestamps já existentes no banco
    const existing = await prisma.priceSnapshot.findMany({
      where: {
        productId: product.id,
      },
      select: {
        timestamp: true,
      },
    });

    const existingTimestamps = new Set(existing.map(e => e.timestamp.getTime()));

    // Filtra apenas registros que não existem no banco
    const toInsert = localHistory.filter(h => !existingTimestamps.has(h.timestamp));

    if (toInsert.length === 0) {
      return { success: true, count: 0 };
    }

    // Insere em batch
    await prisma.priceSnapshot.createMany({
      data: toInsert.map(h => ({
        productId: product.id,
        timestamp: new Date(h.timestamp),
        priceVista: h.priceVista,
        priceParcelado: h.priceParcelado,
        priceOriginal: h.priceOriginal,
        source: 'manual',
      })),
      skipDuplicates: true,
    });

    return { success: true, count: toInsert.length };
  } catch (error) {
    console.error('Erro ao fazer seed do histórico:', error);
    throw error;
  }
}
