// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper para obter/criar usuário baseado no sessionId
async function getOrCreateUser(sessionId: string) {
  let user = await prisma.user.findUnique({
    where: { sessionId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { sessionId },
    });
  }

  return user;
}

// GET /api/favorites - Lista todos os favoritos do usuário
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(sessionId);

    const products = await prisma.product.findMany({
      where: { userId: user.id },
      include: {
        priceHistory: {
          orderBy: { timestamp: 'desc' },
          take: 100, // últimos 100 snapshots
        },
        group: true,
      },
      orderBy: { addedAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Adiciona novo favorito
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
    const { productId, provider, name, image, url, groupId } = body;

    if (!productId || !provider || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, provider, name' },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(sessionId);

    // Verifica se já existe
    const existing = await prisma.product.findUnique({
      where: {
        userId_productId_provider: {
          userId: user.id,
          productId,
          provider,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Product already in favorites', product: existing },
        { status: 409 }
      );
    }

    // Cria o produto
    const product = await prisma.product.create({
      data: {
        userId: user.id,
        productId,
        provider,
        name,
        image,
        url,
        groupId,
      },
      include: {
        priceHistory: true,
        group: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove favorito
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const provider = searchParams.get('provider');

    if (!productId || !provider) {
      return NextResponse.json(
        { error: 'Missing productId or provider' },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(sessionId);

    await prisma.product.deleteMany({
      where: {
        userId: user.id,
        productId,
        provider,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    return NextResponse.json(
      { error: 'Failed to delete favorite' },
      { status: 500 }
    );
  }
}
