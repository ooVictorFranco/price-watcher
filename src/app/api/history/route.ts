// src/app/api/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/history
 * Retorna histórico de preços GLOBAL filtrado por período
 *
 * Busca histórico de TODOS os usuários que têm o produto
 * Isso permite que usuários se beneficiem do histórico coletado por outros
 *
 * Query params:
 * - sessionId: ID da sessão do usuário (opcional, mantido para compatibilidade)
 * - productId: ID do produto (KaBuM/Amazon)
 * - provider: Provider do produto (kabum/amazon)
 * - period: Período do filtro (today|3days|1week|1month|3months|6months)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const provider = searchParams.get('provider');
    const period = searchParams.get('period') || '6months';

    if (!productId || !provider) {
      return NextResponse.json(
        { error: 'productId e provider são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca QUALQUER produto com esse productId e provider (histórico global)
    // Não filtra por userId - pega de todos os usuários
    const product = await prisma.product.findFirst({
      where: {
        productId,
        provider,
      },
      orderBy: {
        lastCheckedAt: 'desc', // Pega o mais recente
      },
    });

    if (!product) {
      return NextResponse.json({ history: [] });
    }

    // Calcula a data inicial baseada no período
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
      default:
        startDate.setMonth(now.getMonth() - 6);
    }

    // Busca TODOS os produtos com esse productId e provider (de todos os usuários)
    const allProducts = await prisma.product.findMany({
      where: {
        productId,
        provider,
      },
      select: {
        id: true,
      },
    });

    const productIds = allProducts.map(p => p.id);

    // Busca o histórico filtrado de TODOS os produtos (histórico global)
    const snapshots = await prisma.priceSnapshot.findMany({
      where: {
        productId: {
          in: productIds, // Histórico de TODOS os usuários
        },
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
        installmentsCount: true,
        installmentsValue: true,
      },
    });

    // Remove duplicatas por timestamp (mesmos produtos podem ter snapshots no mesmo momento)
    const uniqueSnapshots = new Map();
    snapshots.forEach(snap => {
      const key = snap.timestamp.getTime();
      // Se já existe um snapshot nesse timestamp, mantém o que tem mais dados
      if (!uniqueSnapshots.has(key) ||
          (snap.priceVista !== null && uniqueSnapshots.get(key).priceVista === null)) {
        uniqueSnapshots.set(key, snap);
      }
    });

    const dedupedSnapshots = Array.from(uniqueSnapshots.values()).sort((a, b) =>
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Filtra apenas mudanças de preço (mantém primeiro e último sempre)
    const filteredHistory: Array<{
      timestamp: number;
      priceVista: number | null;
      priceParcelado: number | null;
      priceOriginal: number | null;
    }> = [];

    if (dedupedSnapshots.length > 0) {
      // Sempre inclui o primeiro registro
      filteredHistory.push({
        timestamp: dedupedSnapshots[0].timestamp.getTime(),
        priceVista: dedupedSnapshots[0].priceVista,
        priceParcelado: dedupedSnapshots[0].priceParcelado,
        priceOriginal: dedupedSnapshots[0].priceOriginal,
      });

      // Adiciona apenas registros onde houve mudança de preço
      for (let i = 1; i < dedupedSnapshots.length; i++) {
        const current = dedupedSnapshots[i];
        const previous = dedupedSnapshots[i - 1];

        // Verifica se algum preço mudou
        const priceChanged =
          current.priceVista !== previous.priceVista ||
          current.priceParcelado !== previous.priceParcelado ||
          current.priceOriginal !== previous.priceOriginal;

        if (priceChanged) {
          filteredHistory.push({
            timestamp: current.timestamp.getTime(),
            priceVista: current.priceVista,
            priceParcelado: current.priceParcelado,
            priceOriginal: current.priceOriginal,
          });
        }
      }

      // Sempre inclui o último registro (se for diferente do primeiro)
      if (dedupedSnapshots.length > 1) {
        const last = dedupedSnapshots[dedupedSnapshots.length - 1];
        const lastInFiltered = filteredHistory[filteredHistory.length - 1];

        // Só adiciona se não for o mesmo timestamp
        if (last.timestamp.getTime() !== lastInFiltered.timestamp) {
          filteredHistory.push({
            timestamp: last.timestamp.getTime(),
            priceVista: last.priceVista,
            priceParcelado: last.priceParcelado,
            priceOriginal: last.priceOriginal,
          });
        }
      }
    }

    return NextResponse.json({ history: filteredHistory });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico' },
      { status: 500 }
    );
  }
}
