// src/app/api/products/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/products/recent
 * Retorna os últimos 10 produtos únicos pesquisados globalmente (por qualquer usuário)
 * Ordenado por lastCheckedAt (mais recentes primeiro)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = Number.parseInt(searchParams.get('limit') ?? '', 10);
    const poolParam = Number.parseInt(searchParams.get('pool') ?? '', 10);

    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 10;
    const poolSizeRaw = Number.isFinite(poolParam) && poolParam > 0 ? poolParam : limit * 6;
    const poolSize = Math.min(Math.max(poolSizeRaw, limit), 200);

    // Busca os últimos 10 produtos únicos do banco
    // Usa DISTINCT ON (productId, provider) para evitar duplicatas do mesmo produto
    const recentProducts = await prisma.product.findMany({
      where: {
        lastCheckedAt: {
          not: null, // Apenas produtos que já foram verificados
        },
      },
      select: {
        id: true,
        productId: true,
        provider: true,
        name: true,
        image: true,
        lastCheckedAt: true,
      },
      orderBy: {
        lastCheckedAt: 'desc',
      },
      take: poolSize, // Busca um pool maior para permitir randomização antes de limitar
    });

    // Remove duplicatas baseado em productId+provider
    const uniqueProducts = recentProducts.reduce((acc, product) => {
      const key = `${product.productId}-${product.provider}`;
      if (!acc.has(key)) {
        acc.set(key, product);
      }
      return acc;
    }, new Map());

    // Pega apenas os 10 primeiros únicos
    const uniqueList = Array.from(uniqueProducts.values());

    for (let i = uniqueList.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniqueList[i], uniqueList[j]] = [uniqueList[j], uniqueList[i]];
    }

    const selected = uniqueList.slice(0, limit);

    return NextResponse.json({
      products: selected,
      count: selected.length,
      totalAvailable: uniqueList.length,
    });
  } catch (error) {
    console.error('Error fetching recent products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent products' },
      { status: 500 }
    );
  }
}
