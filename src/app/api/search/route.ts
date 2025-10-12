// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseKabumSearch } from '@/lib/parseKabumSearch';
import { parseAmazonSearch } from '@/lib/parseAmazonSearch';
import { SearchResult } from '@/types';

export const runtime = 'nodejs';

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-encoding': 'gzip, deflate, br',
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const provider = (searchParams.get('provider') || 'kabum').trim().toLowerCase();

  if (!q) return NextResponse.json({ results: [], provider });

  const slug = encodeURIComponent(q);
  let results: SearchResult[] = [];

  try {
    if (provider === 'amazon') {
      // Busca na Amazon
      const amazonUrl = `https://www.amazon.com.br/s?k=${slug}`;
      const html = await fetchHtml(amazonUrl);
      results = parseAmazonSearch(html);
    } else {
      // Busca no KaBuM (padrão)
      const candidates = [
        `https://www.kabum.com.br/busca/${slug}`,
        `https://www.kabum.com.br/busca?query=${slug}`,
      ];

      let html: string | null = null;
      for (const u of candidates) {
        try {
          html = await fetchHtml(u);
          if (html) break;
        } catch {
          // tenta o próximo
        }
      }

      if (html) {
        results = parseKabumSearch(html);
      }
    }
  } catch (error) {
    console.error(`[search] Erro ao buscar em ${provider}:`, error);
    return NextResponse.json({
      results: [],
      provider,
      error: 'Falha ao buscar produtos',
    });
  }

  return NextResponse.json({ results, provider });
}
