// src/app/api/products/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products/search?q=termo
 * Busca produtos no banco de dados com autocomplete
 * Retorna: nome, imagem, productId, provider
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Busca produtos que contenham o termo no nome ou no productId
    // Usa ILIKE para case-insensitive search (PostgreSQL)
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            productId: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        productId: true,
        provider: true,
        name: true,
        image: true,
        lastCheckedAt: true,
      },
      orderBy: {
        lastCheckedAt: 'desc', // Produtos mais recentes primeiro
      },
      take: 10, // Limita a 10 resultados para o autocomplete
    });

    // Remove duplicatas (mesmo produto de usuários diferentes)
    const uniqueProducts = new Map();

    products.forEach(product => {
      const key = `${product.provider}:${product.productId}`;
      if (!uniqueProducts.has(key)) {
        uniqueProducts.set(key, {
          productId: product.productId,
          provider: product.provider,
          name: product.name,
          image: product.image,
          lastCheckedAt: product.lastCheckedAt,
        });
      }
    });

    const results = Array.from(uniqueProducts.values());

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}
