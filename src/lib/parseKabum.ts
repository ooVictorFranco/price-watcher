// src/lib/parseKabum.ts
import * as cheerio from 'cheerio';
import type { ApiResponse } from '@/types';

function toNumberBRL(text?: string | null): number | null {
  if (!text) return null;
  const clean = text.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
}

function firstString(x: unknown): string | null {
  if (typeof x === 'string') return x;
  if (Array.isArray(x) && x.length > 0) return String(x[0]);
  return null;
}

type PriceHit = { value: number; start: number; end: number };
const PRICE_RE = /r\$\s*\d{1,3}(?:\.\d{3})*,\d{2}/gi;

function scanPrices(text: string, start: number, end: number): PriceHit[] {
  const s = Math.max(0, start);
  const e = Math.min(text.length, end);
  const slice = text.slice(s, e);
  const out: PriceHit[] = [];
  let m: RegExpExecArray | null;
  PRICE_RE.lastIndex = 0;
  while ((m = PRICE_RE.exec(slice))) {
    const v = toNumberBRL(m[0]);
    if (v != null) {
      out.push({ value: v, start: s + (m.index ?? 0), end: s + (m.index ?? 0) + m[0].length });
    }
  }
  return out;
}

// Encontra o preço mais "próximo" do anchor, preferindo PREÇO ANTES do anchor.
function nearestPriceToAnchor(text: string, anchorIdx: number, beforeWin = 300, afterWin = 320): number | null {
  const hits = scanPrices(text, anchorIdx - beforeWin, anchorIdx + afterWin);
  if (!hits.length) return null;

  let best: PriceHit | null = null;
  let bestScore = Infinity;

  for (const h of hits) {
    // distância em caracteres; leve viés para valores ANTES do anchor
    const before = h.end <= anchorIdx;
    const dist = before ? anchorIdx - h.end : h.start - anchorIdx;
    const bias = before ? -0.5 : +0.5; // favorece preço imediatamente antes
    const score = dist + bias;
    if (score < bestScore) {
      bestScore = score;
      best = h;
    }
  }
  return best?.value ?? null;
}

function findFirstIndexByRegex(text: string, res: RegExp[]): number {
  let best = -1;
  for (const r of res) {
    r.lastIndex = 0;
    const m = r.exec(text);
    if (m && (best === -1 || m.index < best)) best = m.index;
  }
  return best;
}

export function parseKabumHtml(html: string): ApiResponse {
  const $ = cheerio.load(html);

  let name: string | null = null;
  let image: string | null = null;
  let priceBase: number | null = null;

  // 1) JSON-LD para nome/imagem e fallback de preço
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = $(el).contents().text().trim();
      if (!json) return;
      const data = JSON.parse(json);
      const arr = Array.isArray(data) ? data : [data];

      for (const item of arr) {
        const isProduct =
          item['@type'] === 'Product' ||
          (Array.isArray(item['@type']) && item['@type'].includes('Product'));
        if (!isProduct) continue;

        name = name ?? item.name ?? null;
        image = image ?? firstString(item.image);

        const offers = item.offers;
        if (offers) {
          const list = Array.isArray(offers) ? offers : [offers];
          for (const o of list) {
            const p = toNumberBRL(o.price ?? o.lowPrice ?? o.highPrice);
            if (p != null) priceBase = priceBase ?? p;
          }
        }
      }
    } catch {/* ignore */ }
  });

  // 2) Meta OG fallback
  if (!name) name = $('meta[property="og:title"]').attr('content') ?? null;
  if (!image) image = $('meta[property="og:image"]').attr('content') ?? null;

  // 3) Texto limpo, minúsculo
  const text = $('body')
    .clone()
    .find('script,style,noscript')
    .remove()
    .end()
    .text()
    .replace(/\s+/g, ' ')
    .toLowerCase();

  // ---------------- À VISTA (PIX)
  let priceVista: number | null = null;

  // (A) padrão forte: "por: R$ ... à vista"
  {
    const rePorVista = /por:\s*r\$\s*([\d\.\,]+)\s*(?:à|a)\s*vista/i;
    const m = rePorVista.exec(text);
    if (m) priceVista = toNumberBRL(m[1]);
  }

  // (B) âncoras — pega o preço mais próximo, preferindo ANTES do anchor
  if (priceVista == null) {
    const anchors = [
      /à\s*vista\s+no\s*pix/i,
      /à\s*vista/i,
      /a\s*vista/i,
      /pix/i,
    ];
    const idx = findFirstIndexByRegex(text, anchors);
    if (idx >= 0) priceVista = nearestPriceToAnchor(text, idx, 320, 360);
  }

  // ---------------- PARCELADO (TOTAL) e PARCELA
  let priceParcelado: number | null = null;
  let installmentsCount: number | null = null;
  let installmentsValue: number | null = null;

  // (1) "R$ TOTAL em até Nx de R$ PARCELA"
  {
    const re = /r\$\s*([\d\.\,]+)\s*em\s*at[eé]\s*(\d+)\s*x\s*de\s*r\$\s*([\d\.\,]+)/i;
    const m = re.exec(text);
    if (m) {
      priceParcelado = toNumberBRL(m[1]) ?? null;
      installmentsCount = Number(m[2]) || null;
      installmentsValue = toNumberBRL(m[3]) ?? null;
    }
  }

  // (2) "em até Nx de R$ PARCELA" → calcula total
  if (priceParcelado == null) {
    const re = /em\s*at[eé]\s*(\d+)\s*x\s*de\s*r\$\s*([\d\.\,]+)/i;
    const m = re.exec(text);
    if (m) {
      installmentsCount = Number(m[1]) || null;
      installmentsValue = toNumberBRL(m[2]) ?? null;
      if (installmentsCount && installmentsValue != null) {
        priceParcelado = Number((installmentsCount * installmentsValue).toFixed(2));
      }
    }
  }

  // (3) fallback por proximidade de palavras ("parcelad", "sem juros", "em até")
  if (priceParcelado == null) {
    const kws = [/parcelad/i, /sem juros/i, /em até/i, /cart[aã]o/i, /cr[eé]dito/i];
    const idx = findFirstIndexByRegex(text, kws);
    if (idx >= 0) {
      const around = scanPrices(text, idx - 260, idx + 300).map(h => h.value);
      if (around.length) priceParcelado = Math.max(...around);
    }
  }

  // ---------------- PREÇO ORIGINAL
  let priceOriginal: number | null = null;

  // (1) elementos tachados
  $('del, s').each((_, el) => {
    const n = toNumberBRL($(el).text());
    if (n != null) priceOriginal = priceOriginal == null ? n : Math.max(priceOriginal, n);
  });

  // (2) "de: R$ ..."
  if (priceOriginal == null) {
    const m = /de:\s*r\$\s*([\d\.\,]+)/i.exec(text);
    if (m) priceOriginal = toNumberBRL(m[1]);
  }

  // (3) fallback: maior preço no topo
  if (priceOriginal == null) {
    const nums = scanPrices(text, 0, 2000).map(h => h.value);
    if (nums.length) priceOriginal = Math.max(...nums);
  }

  // ---------------- Fallbacks gerais
  if (priceVista == null && priceBase != null) priceVista = priceBase;
  if (priceParcelado == null && priceBase != null) priceParcelado = priceBase;

  return {
    name: name ?? null,
    image: image ?? null,
    priceVista: priceVista ?? null,
    priceParcelado: priceParcelado ?? null,
    priceOriginal: priceOriginal ?? null,
    installmentsCount: installmentsCount ?? null,
    installmentsValue: installmentsValue ?? null,
  };
}
