// src/app/api/scrape-amazon/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseAmazonProduct, extractAsinFromUrl } from '@/lib/parseAmazon';

export const runtime = 'nodejs';

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'accept-encoding': 'gzip, deflate, br',
      'cache-control': 'no-cache',
      'pragma': 'no-cache',
    },
    cache: 'no-store',
    redirect: 'follow', // Segue redirects automaticamente
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  return await res.text();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const asinParam = searchParams.get('asin');
    const urlParam = searchParams.get('url');

    let asin: string | null = null;
    let productUrl: string;

    // Se recebemos um ASIN direto
    if (asinParam && /^[A-Z0-9]{10}$/i.test(asinParam)) {
      asin = asinParam.toUpperCase();
      productUrl = `https://www.amazon.com.br/dp/${asin}`;
    }
    // Se recebemos uma URL
    else if (urlParam) {
      // Verifica se é link encurtado (a.co ou amzn.to)
      const isShortLink = /^https?:\/\/(?:a\.co|amzn\.to)\//i.test(urlParam);

      if (isShortLink) {
        // Links encurtados não são suportados diretamente
        return NextResponse.json(
          {
            error: 'Links encurtados (a.co, amzn.to) não são suportados',
            hint: 'Abra o link no navegador e copie a URL completa do produto (https://www.amazon.com.br/dp/...)',
            url: urlParam,
          },
          { status: 400 }
        );
      }

      // URL normal da Amazon
      asin = extractAsinFromUrl(urlParam);
      if (!asin) {
        return NextResponse.json(
          { error: 'URL da Amazon inválida ou ASIN não encontrado' },
          { status: 400 }
        );
      }
      productUrl = urlParam;
    }
    // Sem parâmetros válidos
    else {
      return NextResponse.json(
        { error: 'Parâmetro "asin" ou "url" é obrigatório' },
        { status: 400 }
      );
    }

    // Faz o scraping
    const html = await fetchHtml(productUrl);
    const parsed = parseAmazonProduct(html);

    // Verifica se conseguiu extrair pelo menos o nome
    if (!parsed.name) {
      return NextResponse.json(
        {
          error: 'Não foi possível extrair informações do produto',
          hint: 'O produto pode estar indisponível ou a estrutura da página mudou',
          debug: {
            asin,
            url: productUrl,
          },
        },
        { status: 422 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error('[scrape-amazon] Erro:', error);

    const message = error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json(
      {
        error: 'Falha ao buscar dados da Amazon',
        message,
        hint: 'A Amazon pode estar bloqueando requisições ou o produto está indisponível',
      },
      { status: 500 }
    );
  }
}
