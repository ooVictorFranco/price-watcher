// src/app/api/products/recent/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/products/recent
 * Retorna os últimos 10 produtos únicos pesquisados globalmente (por qualquer usuário)
 * Ordenado por lastCheckedAt (mais recentes primeiro)
 */
export async function GET() {
  try {
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
      take: 30, // Busca 30 para depois filtrar duplicatas
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
    const topTen = Array.from(uniqueProducts.values()).slice(0, 10);

    return NextResponse.json({
      products: topTen,
      count: topTen.length,
    });
  } catch (error) {
    console.error('Error fetching recent products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent products' },
      { status: 500 }
    );
  }
}
