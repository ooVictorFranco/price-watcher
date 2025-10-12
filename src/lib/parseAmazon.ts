// src/lib/parseAmazon.ts
import * as cheerio from 'cheerio';
import { ApiResponse } from '@/types';

/**
 * Parser para produtos da Amazon.com.br
 *
 * A Amazon usa múltiplos templates e pode renderizar preços de várias formas.
 * Este parser tenta extrair informações dos seletores mais comuns.
 */

export function parseAmazonProduct(html: string): ApiResponse {
  const $ = cheerio.load(html);

  // Nome do produto
  const name =
    $('#productTitle').text().trim() ||
    $('h1[id*="title"]').first().text().trim() ||
    $('span[id="productTitle"]').text().trim() ||
    null;

  // Imagem principal
  const image =
    $('#landingImage').attr('src') ||
    $('#imgBlkFront').attr('src') ||
    $('img[data-old-hires]').first().attr('data-old-hires') ||
    $('img[data-a-dynamic-image]').first().attr('src') ||
    null;

  // Preço à vista (preço principal/atual)
  let priceVista: number | null = null;

  // Seletores comuns para preço principal (a-offscreen tem o preço completo)
  const priceSelectors = [
    '.a-price[data-a-color="price"] .a-offscreen',
    '.a-price[data-a-strike="false"] .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price .a-offscreen',
  ];

  for (const selector of priceSelectors) {
    const priceText = $(selector).first().text().trim();
    if (priceText) {
      const parsed = parsePrice(priceText);
      if (parsed) {
        priceVista = parsed;
        break;
      }
    }
  }

  // Se não encontrou com a-offscreen, tenta montar o preço completo de whole + fraction
  if (!priceVista) {
    // Busca no elemento pai que contém o preço completo
    const priceElements = $('.a-price[data-a-color="price"], .a-price[data-a-strike="false"]');

    for (let i = 0; i < priceElements.length; i++) {
      const priceEl = $(priceElements[i]);
      const wholeText = priceEl.find('.a-price-whole').text().trim();
      const fractionText = priceEl.find('.a-price-fraction').text().trim();

      if (wholeText) {
        // Monta o preço completo: "67" + "74" = "67,74"
        const priceText = fractionText ? `${wholeText},${fractionText}` : wholeText;
        const parsed = parsePrice(priceText);
        if (parsed) {
          priceVista = parsed;
          break;
        }
      }
    }
  }

  // Se não encontrou, tenta pegar do JSON-LD (structured data)
  if (!priceVista) {
    try {
      const jsonLd = $('script[type="application/ld+json"]').html();
      if (jsonLd) {
        const data = JSON.parse(jsonLd);
        if (data?.offers?.price) {
          priceVista = parseFloat(data.offers.price);
        } else if (Array.isArray(data?.offers) && data.offers[0]?.price) {
          priceVista = parseFloat(data.offers[0].price);
        }
      }
    } catch {
      // Ignora erros de parsing JSON-LD
    }
  }

  // Última tentativa: busca em áreas específicas de preço
  if (!priceVista) {
    const priceAreas = [
      '#corePrice_desktop',
      '#corePriceDisplay_desktop_feature_div',
      '[data-feature-name="corePrice"]',
      '.a-section.a-spacing-none',
    ];

    for (const area of priceAreas) {
      const areaText = $(area).text();
      // Busca por padrão "R$ 67,74" com centavos
      const priceMatch = areaText.match(/R\$\s*([\d]+[,.][\d]{2})/);
      if (priceMatch) {
        const parsed = parsePrice(priceMatch[1]);
        if (parsed && parsed > 0) {
          priceVista = parsed;
          break;
        }
      }
    }
  }

  // Preço parcelado (com juros)
  let priceParcelado: number | null = null;
  let installmentsCount: number | null = null;
  let installmentsValue: number | null = null;

  // Busca informações de parcelamento - seletores mais abrangentes
  const installmentSelectors = [
    '#installmentPrice',
    '#apex_offerDisplay_desktop',
    '#newAccordionRow_0',
    '.a-size-base.a-color-secondary',
    '[data-feature-name="desktop_buybox_group"] span',
    '#corePrice_feature_div span',
    '.a-price-whole + .a-price-decimal + .a-price-fraction',
  ];

  let installmentText = '';
  for (const selector of installmentSelectors) {
    const text = $(selector).text().trim();
    if (text && /\d+x/.test(text)) {
      installmentText = text;
      break;
    }
  }

  // Se não encontrou com seletores, busca em todo o texto
  if (!installmentText) {
    const bodyText = $('body').text();
    const match = bodyText.match(/em\s+até\s+(\d+)x\s+(?:de\s+)?R?\$?\s*([\d.,]+)/i);
    if (match) {
      installmentText = match[0];
    }
  }

  // Regex para extrair parcelamento: várias variações
  const installmentPatterns = [
    /(\d+)x\s+de\s+R?\$?\s*([\d.,]+)/i,           // "12x de R$ 15,00"
    /em\s+até\s+(\d+)x\s+de\s+R?\$?\s*([\d.,]+)/i, // "em até 12x de R$ 15,00"
    /(\d+)\s*x\s*R?\$?\s*([\d.,]+)/i,              // "12x R$ 15,00"
  ];

  for (const pattern of installmentPatterns) {
    const match = installmentText.match(pattern);
    if (match) {
      installmentsCount = parseInt(match[1], 10);
      const valuePerInstallment = parsePrice(match[2]);
      if (valuePerInstallment && installmentsCount) {
        installmentsValue = valuePerInstallment;
        priceParcelado = valuePerInstallment * installmentsCount;
        break;
      }
    }
  }

  // Preço original (de/por)
  let priceOriginal: number | null = null;

  const originalSelectors = [
    '.a-price[data-a-strike="true"] .a-offscreen',
    '.a-text-price .a-offscreen',
    '#priceblock_saleprice',
    'span.a-price.a-text-price',
  ];

  for (const selector of originalSelectors) {
    const originalText = $(selector).first().text().trim();
    if (originalText) {
      const parsed = parsePrice(originalText);
      if (parsed && parsed > (priceVista || 0)) {
        priceOriginal = parsed;
        break;
      }
    }
  }

  return {
    name,
    image,
    priceVista,
    priceParcelado,
    priceOriginal,
    installmentsCount,
    installmentsValue,
  };
}

/**
 * Converte string de preço brasileiro para número
 * Ex: "R$ 1.234,56" -> 1234.56
 */
function parsePrice(text: string): number | null {
  if (!text) return null;

  // Remove tudo exceto dígitos, pontos e vírgulas
  const cleaned = text.replace(/[^\d.,]/g, '');

  // Formato brasileiro: 1.234,56
  if (cleaned.includes(',')) {
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  // Formato americano ou número simples: 1234.56
  const num = parseFloat(cleaned);
  return Number.isFinite(num) && num > 0 ? num : null;
}

/**
 * Extrai ASIN de uma URL da Amazon
 */
export function extractAsinFromUrl(url: string): string | null {
  // Padrões comuns:
  // https://www.amazon.com.br/dp/B0F7Z9F9SD
  // https://www.amazon.com.br/product-name/dp/B0F7Z9F9SD
  // https://a.co/d/abc123
  // https://amzn.to/abc123

  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/ASIN\/([A-Z0-9]{10})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1].toUpperCase();
  }

  return null;
}
