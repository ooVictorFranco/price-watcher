// src/app/api/cron/cleanup-old-prices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Cron job que roda diariamente para limpar preços com mais de 180 dias
 *
 * Configurar no vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-old-prices",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica token de autorização do Vercel Cron
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calcula a data de 180 dias atrás
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 180);

    console.log(`[Cleanup] Removendo preços anteriores a ${cutoffDate.toISOString()}`);

    // Remove preços antigos
    const result = await prisma.priceSnapshot.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`[Cleanup] ${result.count} registros removidos com sucesso`);

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      cutoffDate: cutoffDate.toISOString(),
    });
  } catch (error) {
    console.error('[Cleanup] Erro ao limpar preços antigos:', error);
    return NextResponse.json(
      { error: 'Erro ao limpar preços antigos' },
      { status: 500 }
    );
  }
}
