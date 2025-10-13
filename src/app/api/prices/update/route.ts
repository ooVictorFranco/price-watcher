// src/app/api/prices/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/prices/update - Atualiza preço de um produto específico
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      productId,
      provider,
      priceVista,
      priceParcelado,
      priceOriginal,
      installmentsCount,
      installmentsValue,
      source = 'manual',
    } = body;

    if (!productId || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, provider' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { sessionId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

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
      return NextResponse.json(
        { error: 'Product not found in favorites' },
        { status: 404 }
      );
    }

    // Cria snapshot de preço
    const snapshot = await prisma.priceSnapshot.create({
      data: {
        productId: product.id,
        priceVista: priceVista ?? null,
        priceParcelado: priceParcelado ?? null,
        priceOriginal: priceOriginal ?? null,
        installmentsCount: installmentsCount ?? null,
        installmentsValue: installmentsValue ?? null,
        source,
      },
    });

    // Atualiza lastCheckedAt e informações de parcelamento
    await prisma.product.update({
      where: { id: product.id },
      data: {
        lastCheckedAt: new Date(),
        installmentsCount: installmentsCount ?? product.installmentsCount,
        installmentsValue: installmentsValue ?? product.installmentsValue,
      },
    });

    return NextResponse.json({ snapshot, success: true });
  } catch (error) {
    console.error('Error updating price:', error);
    return NextResponse.json(
      { error: 'Failed to update price' },
      { status: 500 }
    );
  }
}
