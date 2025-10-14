// src/app/api/history/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { savePriceSnapshot, seedPriceHistoryFromLocal } from '@/lib/price-history';

export const dynamic = 'force-dynamic';

/**
 * POST /api/history/save
 * Salva um snapshot de preço no banco de dados
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      productId,
      provider,
      priceVista,
      priceParcelado,
      priceOriginal,
      installmentsCount,
      installmentsValue,
      source,
      localHistory, // Opcional: array de histórico do localStorage para fazer seed
    } = body;

    if (!sessionId || !productId || !provider) {
      return NextResponse.json(
        { error: 'sessionId, productId e provider são obrigatórios' },
        { status: 400 }
      );
    }

    // Se foi fornecido histórico local, faz o seed primeiro
    if (localHistory && Array.isArray(localHistory) && localHistory.length > 0) {
      try {
        await seedPriceHistoryFromLocal(sessionId, productId, provider, localHistory);
      } catch (error) {
        console.error('Erro ao fazer seed do histórico:', error);
        // Não falha a operação se o seed falhar
      }
    }

    // Salva o snapshot atual
    await savePriceSnapshot(sessionId, productId, provider, {
      priceVista,
      priceParcelado,
      priceOriginal,
      installmentsCount,
      installmentsValue,
      source: source || 'manual',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar snapshot:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar snapshot' },
      { status: 500 }
    );
  }
}
