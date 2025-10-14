// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CACHE_DURATION = 60 * 60 * 1000; // 60 minutos (1 hora) em ms

/**
 * GET /api/products/:id
 * Busca produto no cache do banco de dados
 * Se não existir ou estiver desatualizado (>60min), retorna 404 para indicar que precisa fazer scraping
 *
 * Estratégia: Cache compartilhado entre usuários com TTL de 60 minutos
 * - Usuário A pesquisa → scraping + salva no cache
 * - Usuário B pesquisa (dentro de 60min) → usa cache do usuário A
 * - Usuário C pesquisa (após 60min) → novo scraping + atualiza cache
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const provider = request.nextUrl.searchParams.get('provider') || 'kabum';

    // Busca qualquer registro deste produto no banco (de qualquer usuário)
    const product = await prisma.product.findFirst({
      where: {
        productId: id,
        provider,
      },
      include: {
        priceHistory: {
          orderBy: { timestamp: 'desc' },
          take: 1, // Apenas o último snapshot
        },
      },
      orderBy: {
        lastCheckedAt: 'desc', // Pega o mais recente
      },
    });

    // Produto não existe no cache
    if (!product) {
      return NextResponse.json(
        { cached: false, reason: 'not_found' },
        { status: 404 }
      );
    }

    // Verifica se o cache está válido (< 60 minutos)
    const lastCheck = product.lastCheckedAt ? new Date(product.lastCheckedAt).getTime() : 0;
    const now = Date.now();
    const isStale = now - lastCheck > CACHE_DURATION;

    // Cache expirado
    if (isStale) {
      return NextResponse.json(
        {
          cached: false,
          reason: 'stale',
          lastCheckedAt: product.lastCheckedAt,
          ageMs: now - lastCheck,
        },
        { status: 404 }
      );
    }

    // Cache válido! Retorna os dados
    const latestSnapshot = product.priceHistory[0];

    return NextResponse.json({
      cached: true,
      product: {
        name: product.name,
        image: product.image,
        priceVista: latestSnapshot?.priceVista ?? null,
        priceParcelado: latestSnapshot?.priceParcelado ?? null,
        priceOriginal: latestSnapshot?.priceOriginal ?? null,
        installmentsCount: product.installmentsCount,
        installmentsValue: product.installmentsValue,
        lastCheckedAt: product.lastCheckedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching cached product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
