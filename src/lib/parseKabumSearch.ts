// src/lib/parseKabumSearch.ts
import * as cheerio from 'cheerio';
import { SearchResult } from '@/types';

const PROD_RE = /\/produto\/(\d+)/;

function uniq<T>(arr: T[], key: (x: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of arr) {
    const k = key(it);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(it);
    }
  }
  return out;
}

export function parseKabumSearch(html: string): SearchResult[] {
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  // ---- 1) anchors com /produto/{id}
  $('a[href*="/produto/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const m = href.match(PROD_RE);
    if (!m) return;
    const id = m[1];

    // título: do link, ou do container próximo
    let name = ($(el).attr('title') || $(el).text() || '').trim();
    if (!name) {
      const near = $(el).closest('article,li,div').find('h3,h2,.title,.product-title').first().text().trim();
      if (near) name = near;
    }

    // imagem
    let image: string | null | undefined = null;
    const img = $(el).find('img').first();
    if (img.length) {
      image = img.attr('src') || img.attr('data-src') || img.attr('data-original') || null;
    } else {
      const nearImg = $(el).closest('article,li,div').find('img').first();
      if (nearImg.length) {
        image = nearImg.attr('src') || nearImg.attr('data-src') || nearImg.attr('data-original') || null;
      }
    }

    results.push({ id, name: name || `Produto ${id}`, image });
  });

  // ---- 2) JSON-LD com ItemList (quando a página injeta)
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).contents().text().trim();
      if (!raw) return;
      const data = JSON.parse(raw);
      const arr = Array.isArray(data) ? data : [data];

      for (const item of arr) {
        if (item['@type'] === 'ItemList' && Array.isArray(item.itemListElement)) {
          for (const li of item.itemListElement) {
            const u = li?.url || li?.item?.url;
            const n = li?.name || li?.item?.name;
            const img = li?.image || li?.item?.image || null;
            if (!u) continue;
            const m = String(u).match(PROD_RE);
            if (!m) continue;
            results.push({ id: m[1], name: (n || `Produto ${m[1]}`) as string, image: img ?? null });
          }
        }
      }
    } catch {
      // ignora json inválido
    }
  });

  // ---- 3) fallback bruto: qualquer /produto/{id} no HTML
  if (results.length === 0) {
    const ids = new Set<string>();
    const re = /\/produto\/(\d+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      ids.add(m[1]);
    }
    for (const id of ids) {
      results.push({ id, name: `Produto ${id}`, image: null });
    }
  }

  // normaliza
  return uniq(results, r => r.id).slice(0, 30);
}
