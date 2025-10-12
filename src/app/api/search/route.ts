// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseKabumSearch } from '@/lib/parseKabumSearch';

export const runtime = 'nodejs';

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17 Safari/605.1.15',
      'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'accept': 'text/html,*/*',
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q) return NextResponse.json({ results: [] });

  const slug = encodeURIComponent(q);
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

  if (!html) {
    return NextResponse.json({ results: [] });
  }

  const results = parseKabumSearch(html);
  return NextResponse.json({ results });
}
