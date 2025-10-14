// src/app/api/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/session-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/history
 * Retorna histórico de preços filtrado por período
 *
 * Query params:
 * - sessionId: ID da sessão do usuário
 * - productId: ID do produto (KaBuM/Amazon)
 * - provider: Provider do produto (kabum/amazon)
 * - period: Período do filtro (today|3days|1week|1month|3months|6months)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const productId = searchParams.get('productId');
    const provider = searchParams.get('provider');
    const period = searchParams.get('period') || '6months';

    if (!sessionId || !productId || !provider) {
      return NextResponse.json(
        { error: 'sessionId, productId e provider são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca ou cria o usuário
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

    // Busca o histórico filtrado
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
        installmentsCount: true,
        installmentsValue: true,
      },
    });

    // Converte para formato compatível com o frontend
    const history = snapshots.map(snap => ({
      timestamp: snap.timestamp.getTime(),
      priceVista: snap.priceVista,
      priceParcelado: snap.priceParcelado,
      priceOriginal: snap.priceOriginal,
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico' },
      { status: 500 }
    );
  }
}
