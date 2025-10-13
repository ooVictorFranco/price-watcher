// src/app/api/products/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/products/save
 * Salva resultado de scraping no banco (produtos pesquisados, não necessariamente favoritados)
 * Cria uma entrada "global" usando um usuário anônimo para compartilhar dados entre todos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      provider,
      name,
      image,
      priceVista,
      priceParcelado,
      priceOriginal,
      installmentsCount,
      installmentsValue,
    } = body;

    if (!productId || !provider || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, provider, name' },
        { status: 400 }
      );
    }

    // Usuário "global" para produtos não favoritados (sistema de seed)
    const GLOBAL_SESSION_ID = 'global-cache-user';

    // Busca ou cria usuário global
    let globalUser = await prisma.user.findUnique({
      where: { sessionId: GLOBAL_SESSION_ID },
    });

    if (!globalUser) {
      globalUser = await prisma.user.create({
        data: { sessionId: GLOBAL_SESSION_ID },
      });
    }

    // Verifica se produto já existe (de qualquer usuário, incluindo o global)
    let product = await prisma.product.findFirst({
      where: {
        productId,
        provider,
      },
      orderBy: {
        lastCheckedAt: 'desc',
      },
    });

    // Se não existe, cria no usuário global
    if (!product) {
      product = await prisma.product.create({
        data: {
          userId: globalUser.id,
          productId,
          provider,
          name,
          image,
          url: null,
          groupId: null,
          installmentsCount,
          installmentsValue,
          lastCheckedAt: new Date(),
        },
      });
    } else {
      // Atualiza informações do produto existente
      product = await prisma.product.update({
        where: { id: product.id },
        data: {
          name,
          image,
          installmentsCount,
          installmentsValue,
          lastCheckedAt: new Date(),
        },
      });
    }

    // Adiciona snapshot de preço
    const snapshot = await prisma.priceSnapshot.create({
      data: {
        productId: product.id,
        priceVista: priceVista ?? null,
        priceParcelado: priceParcelado ?? null,
        priceOriginal: priceOriginal ?? null,
        installmentsCount: installmentsCount ?? null,
        installmentsValue: installmentsValue ?? null,
        source: 'search', // Nova origem: busca (não favorito)
      },
    });

    console.log(`[GLOBAL-CACHE] Saved product ${productId} (${provider}) to database`);

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        productId: product.productId,
        provider: product.provider,
      },
      snapshot: {
        id: snapshot.id,
        timestamp: snapshot.timestamp,
      },
    });
  } catch (error) {
    console.error('Error saving product to global cache:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: 'Failed to save product', details: errorMessage },
      { status: 500 }
    );
  }
}
