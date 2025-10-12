// src/app/api/scrape/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseKabumHtml } from '@/lib/parseKabum';

export const runtime = 'nodejs';

function normalizeUrl(id?: string | null, url?: string | null) {
  if (id && /^\d+$/.test(id)) return `https://www.kabum.com.br/produto/${id}`;
  if (url && /^https?:\/\//i.test(url)) return url;
  throw new Error('Forneça ?id=123456 ou ?url=https://...');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const url = searchParams.get('url');

  try {
    const target = normalizeUrl(id, url);
    const res = await fetch(target, {
      method: 'GET',
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17 Safari/605.1.15',
        'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Falha ao buscar a página do produto.' }, { status: 502 });
    }

    const html = await res.text();
    const parsed = parseKabumHtml(html);

    return NextResponse.json({ resolvedUrl: target, ...parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Erro inesperado' }, { status: 400 });
  }
}
