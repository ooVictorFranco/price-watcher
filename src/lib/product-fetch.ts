// src/lib/product-fetch.ts
'use client';

interface ProductData {
  name: string | null;
  image: string | null;
  priceVista: number | null;
  priceParcelado: number | null;
  priceOriginal: number | null;
  installmentsCount?: number | null;
  installmentsValue?: number | null;
}

interface FetchResult {
  data: ProductData;
  cached: boolean;
  source: 'database' | 'scraping';
}

/**
 * Busca produto com estratégia de cache:
 * 1. Tenta buscar no banco (cache compartilhado)
 * 2. Se não encontrar ou estiver desatualizado, faz scraping
 * 3. Salva resultado do scraping no banco para próximos usuários
 */
export async function fetchProductWithCache(
  productId: string,
  provider: 'kabum' | 'amazon'
): Promise<FetchResult> {
  try {
    // 1. Tenta buscar do cache (banco de dados)
    const cacheResponse = await fetch(
      `/api/products/${encodeURIComponent(productId)}?provider=${provider}`,
      { cache: 'no-store' }
    );

    if (cacheResponse.ok) {
      const cacheData = await cacheResponse.json();
      console.log(`[CACHE] ✓ Hit for ${productId} (${provider})`);

      return {
        data: cacheData.product,
        cached: true,
        source: 'database',
      };
    }

    // 2. Cache miss ou stale - fazer scraping
    const reason = cacheResponse.status === 404
      ? await cacheResponse.json().then(d => d.reason).catch(() => 'unknown')
      : 'error';

    console.log(`[CACHE] ✗ Miss for ${productId} (${provider}) - reason: ${reason}`);

    // 3. Fazer scraping da loja
    const scrapedData = await scrapeProduct(productId, provider);

    return {
      data: scrapedData,
      cached: false,
      source: 'scraping',
    };
  } catch (error) {
    console.error(`[CACHE] Error fetching product ${productId}:`, error);
    throw error;
  }
}

/**
 * Faz scraping do produto na loja
 */
async function scrapeProduct(
  productId: string,
  provider: 'kabum' | 'amazon'
): Promise<ProductData> {
  let response: Response;

  if (provider === 'amazon') {
    const url = new URL(window.location.origin + '/api/scrape-amazon');

    // ASIN ou URL
    if (/^[A-Z0-9]{10}$/i.test(productId)) {
      url.searchParams.set('asin', productId);
    } else {
      url.searchParams.set('url', productId);
    }

    response = await fetch(url.toString(), { cache: 'no-store' });
  } else {
    const url = new URL(window.location.origin + '/api/scrape');

    // ID numérico ou URL
    if (/^\d+$/.test(productId)) {
      url.searchParams.set('id', productId);
    } else {
      url.searchParams.set('url', productId);
    }

    response = await fetch(url.toString(), { cache: 'no-store' });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to scrape product: ${response.status}`);
  }

  const data = await response.json();

  const productData = {
    name: data.name ?? null,
    image: data.image ?? null,
    priceVista: data.priceVista ?? null,
    priceParcelado: data.priceParcelado ?? null,
    priceOriginal: data.priceOriginal ?? null,
    installmentsCount: data.installmentsCount ?? null,
    installmentsValue: data.installmentsValue ?? null,
  };

  // Salva resultado no cache global (não bloqueia o retorno)
  saveToGlobalCache(productId, provider, productData).catch(err => {
    console.error('[CACHE] Failed to save to global cache:', err);
  });

  return productData;
}

/**
 * Salva produto no cache global após scraping
 */
async function saveToGlobalCache(
  productId: string,
  provider: 'kabum' | 'amazon',
  data: ProductData
): Promise<void> {
  try {
    await fetch('/api/products/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        provider,
        name: data.name,
        image: data.image,
        priceVista: data.priceVista,
        priceParcelado: data.priceParcelado,
        priceOriginal: data.priceOriginal,
        installmentsCount: data.installmentsCount,
        installmentsValue: data.installmentsValue,
      }),
    });

    console.log(`[CACHE] ✓ Saved ${productId} to global cache`);
  } catch (error) {
    console.error(`[CACHE] ✗ Failed to save ${productId}:`, error);
  }
}

/**
 * Detecta provider baseado no ID
 */
export function detectProvider(id: string): 'kabum' | 'amazon' {
  // ASIN da Amazon (10 caracteres alfanuméricos) ou URL da Amazon
  if (/^[A-Z0-9]{10}$/i.test(id) || id.includes('amazon.com')) {
    return 'amazon';
  }
  // KaBuM (numérico) ou URL do KaBuM
  return 'kabum';
}
