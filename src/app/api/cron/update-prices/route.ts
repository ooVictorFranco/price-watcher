// src/app/api/cron/update-prices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as cheerio from 'cheerio';

// Função para fazer scraping do KaBuM
async function scrapeKabum(productId: string) {
  try {
    const url = `https://www.kabum.com.br/produto/${productId}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extrai preços (adapte conforme necessário)
    const priceVistaText = $('[class*="finalPrice"]').first().text().trim();
    const priceVista = priceVistaText
      ? parseFloat(priceVistaText.replace(/[^\d,]/g, '').replace(',', '.'))
      : null;

    const priceOriginalText = $('[class*="oldPrice"]').first().text().trim();
    const priceOriginal = priceOriginalText
      ? parseFloat(priceOriginalText.replace(/[^\d,]/g, '').replace(',', '.'))
      : null;

    return {
      priceVista,
      priceOriginal,
      priceParcelado: null,
    };
  } catch (error) {
    console.error(`Error scraping KaBuM ${productId}:`, error);
    return null;
  }
}

// Função para fazer scraping da Amazon
async function scrapeAmazon(asin: string) {
  try {
    const url = `https://www.amazon.com.br/dp/${asin}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extrai preços (adapte conforme necessário)
    const priceVistaText = $('.a-price-whole').first().text().trim();
    const priceVista = priceVistaText
      ? parseFloat(priceVistaText.replace(/[^\d,]/g, '').replace(',', '.'))
      : null;

    return {
      priceVista,
      priceOriginal: null,
      priceParcelado: null,
    };
  } catch (error) {
    console.error(`Error scraping Amazon ${asin}:`, error);
    return null;
  }
}

// GET /api/cron/update-prices - Atualiza preços de todos os produtos
// Este endpoint será chamado automaticamente pela Vercel Cron
export async function GET(request: NextRequest) {
  try {
    // Verifica autorização (apenas a Vercel pode chamar)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Starting daily price update job...');

    // Busca todos os produtos que precisam ser atualizados
    // (produtos não atualizados nas últimas 24 horas)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { lastCheckedAt: null },
          { lastCheckedAt: { lt: twentyFourHoursAgo } },
        ],
      },
      // Sem limite - processa todos os produtos em uma única execução diária
    });

    console.log(`[CRON] Found ${products.length} products to update`);

    const results = {
      total: products.length,
      success: 0,
      failed: 0,
      skipped: 0,
    };

    // Atualiza cada produto
    for (const product of products) {
      try {
        let prices = null;

        if (product.provider === 'kabum') {
          prices = await scrapeKabum(product.productId);
        } else if (product.provider === 'amazon') {
          prices = await scrapeAmazon(product.productId);
        }

        if (prices) {
          // Cria snapshot de preço
          await prisma.priceSnapshot.create({
            data: {
              productId: product.id,
              priceVista: prices.priceVista,
              priceParcelado: prices.priceParcelado,
              priceOriginal: prices.priceOriginal,
              source: 'scheduled',
            },
          });

          // Atualiza lastCheckedAt
          await prisma.product.update({
            where: { id: product.id },
            data: { lastCheckedAt: new Date() },
          });

          results.success++;
          console.log(`[CRON] ✓ Updated ${product.provider}:${product.productId}`);
        } else {
          results.failed++;
          console.log(`[CRON] ✗ Failed to scrape ${product.provider}:${product.productId}`);
        }

        // Delay entre requests para evitar rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`[CRON] Error updating product ${product.id}:`, error);
        results.failed++;
      }
    }

    console.log('[CRON] Price update job completed:', results);

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Fatal error in price update job:', error);
    return NextResponse.json(
      { error: 'Failed to update prices', details: String(error) },
      { status: 500 }
    );
  }
}
