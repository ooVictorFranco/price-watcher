// src/app/api/scrape-amazon/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Amazon temporariamente desativada.
 *
 * Motivo: scraping ainda instável para alguns templates (preço à vista/original).
 * Enquanto calibramos, devolvemos 503 com um payload padronizado para a UI
 * exibir um aviso amigável (toast / banner) sem quebrar o fluxo.
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const asin = searchParams.get('asin');
  const url = searchParams.get('url');

  // ecoamos o que o usuário mandou só para referência na UI/log
  return NextResponse.json(
    {
      provider: 'amazon',
      disabled: true,
      message:
        'Suporte à Amazon está em beta: resultados podem estar imprecisos. Monitoramento temporariamente desativado.',
      hint:
        'Use produtos do KaBuM! por enquanto. Assim que a integração com a Amazon estiver estável, reativaremos aqui.',
      requested: { asin, url },
    },
    { status: 503 }
  );
}
