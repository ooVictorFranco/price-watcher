// src/lib/parseAmazonSearch.ts
import * as cheerio from 'cheerio';
import { SearchResult } from '@/types';

/**
 * Parser para resultados de busca da Amazon.com.br
 *
 * A Amazon renderiza resultados de busca com múltiplos templates.
 * Este parser tenta extrair informações dos seletores mais comuns.
 */

export function parseAmazonSearch(html: string): SearchResult[] {
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  // Seletores para itens de busca da Amazon
  // A Amazon usa principalmente: [data-component-type="s-search-result"]
  const items = $('[data-component-type="s-search-result"]');

  items.each((_, element) => {
    try {
      const $item = $(element);

      // ASIN (ID do produto)
      const asin = $item.attr('data-asin');
      if (!asin) return;

      // Nome do produto
      const name =
        $item.find('h2 a span').text().trim() ||
        $item.find('.a-size-medium.a-color-base.a-text-normal').text().trim() ||
        $item.find('.a-size-base-plus.a-color-base.a-text-normal').text().trim() ||
        '';

      if (!name) return;

      // Imagem
      const image =
        $item.find('img.s-image').attr('src') ||
        $item.find('img[data-image-latency]').attr('src') ||
        null;

      results.push({
        id: asin,
        name,
        image,
      });
    } catch {
      // Ignora itens com erro de parsing
    }
  });

  return results;
}

/**
 * Monta URL de busca na Amazon
 */
export function amazonSearchUrl(query: string): string {
  return `https://www.amazon.com.br/s?k=${encodeURIComponent(query)}`;
}
