// src/types.ts

/** Loja/Origem suportada pelo app */
export type Provider = 'kabum' | 'amazon';

/** Chave canônica de produto: ex. "kabum:922662" ou "amazon:B0FMYR9C72" */
export type ProductKey = `${Provider}:${string}`;

/** Informações básicas do produto (dados “estáticos”) */
export interface ProductInfo {
  provider: Provider;
  /** KaBuM!: id numérico; Amazon: ASIN (10 chars) */
  id?: string | null;     // usado para KaBuM!
  asin?: string | null;   // usado para Amazon
  url: string;
  name: string | null;
  image: string | null;
  /** Última checagem (epoch ms) — útil para UI */
  lastCheckedAt?: number | null;
}

/** Ponto do histórico de preços (amostragem) */
export interface PriceSnapshot {
  /** timestamp (epoch ms) da coleta */
  ts: number;
  /** Preço à vista (PIX/cartão à vista), quando detectado */
  priceVista: number | null;
  /** Total parcelado (ex.: 10x de 100 = 1000), quando detectado */
  priceParcelado: number | null;
  /** Preço “De:”/original (riscado), quando detectado */
  priceOriginal: number | null;
  /** Parcelas anunciadas (ex.: 10) */
  installmentsCount: number | null;
  /** Valor por parcela (ex.: 100.00) */
  installmentsValue: number | null;
  /** Origem da coleta: manual, agendada (bg) ou automática */
  source: 'manual' | 'scheduled' | 'auto';
}

/** Item monitorado (informação + histórico local) */
export interface MonitoredItem {
  key: ProductKey;
  info: ProductInfo;
  history: PriceSnapshot[];
  /** Criado quando entrou em favoritos (epoch ms) */
  addedAt: number;
}

/** Card/favorito salvo pelo usuário */
export interface Favorite {
  key: ProductKey;
  info: ProductInfo;
  addedAt: number;            // epoch ms
  lastCheckedAt: number | null;
}

/* ──────────────────────────────────────────────────────────────────────────
 *               Tipos de resposta dos endpoints de scraping
 * ──────────────────────────────────────────────────────────────────────────*/

/** Resposta de scraping (KaBuM!) */
export interface ScrapeKabumResult {
  provider: 'kabum';
  url: string;
  id: string | null;      // id KaBuM!
  asin?: null;            // sempre null aqui (compat)
  name: string | null;
  image: string | null;

  priceVista: number | null;
  priceParcelado: number | null;
  priceOriginal: number | null;

  installmentsCount: number | null;
  installmentsValue: number | null;
}

/** Resposta de scraping (Amazon OK) */
export interface ScrapeAmazonResult {
  provider: 'amazon';
  url: string;
  asin: string | null;    // ASIN
  id?: null;              // sempre null aqui (compat)
  name: string | null;
  image: string | null;

  priceVista: number | null;
  priceParcelado: number | null;
  priceOriginal: number | null;

  installmentsCount: number | null;
  installmentsValue: number | null;
}

/** Payload quando a Amazon está temporariamente desativada (HTTP 503) */
export interface ScrapeAmazonDisabled {
  provider: 'amazon';
  disabled: true;
  message: string;
  hint?: string;
  requested?: { asin?: string | null; url?: string | null };
}

/** União final usada na camada de fetch/UI */
export type ScrapeResult =
  | ScrapeKabumResult
  | ScrapeAmazonResult
  | ScrapeAmazonDisabled;

/* ──────────────────────────────────────────────────────────────────────────
 *                           Backup / Importação
 * ──────────────────────────────────────────────────────────────────────────*/

/** Metadados do “arquivo vivo” (OPFS/File System Access). Ponteiro abstrato. */
export interface LiveFileMeta {
  enabled: boolean;
  /** Estrategia atual: 'opfs' (Origin Private FS), 'file-handle' (FS Access API), 'external' (outros) */
  kind: 'opfs' | 'file-handle' | 'external';
  /**
   * Ponteiro/identificador persistível. Para 'file-handle', pode ser um id serializado.
   * Para 'opfs', pode ser um caminho lógico. Para 'external', um identificador próprio.
   */
  pointer?: string | null;
  /** Última sincronização bem-sucedida (epoch ms) */
  lastSyncAt?: number | null;
}

/** Estrutura do arquivo de backup/exportação */
export interface BackupFile {
  /** Versão do schema deste arquivo — útil para migrações */
  version: '1';
  /** Epoch ms de criação do arquivo */
  createdAt: number;
  /** Retenção aplicada (dias) — ex.: 90 */
  retentionDays: number;

  /** Lista de favoritos salvos */
  favorites: Favorite[];
  /**
   * Históricos por produto — chave é ProductKey (ex.: "kabum:922662").
   * Cada entrada contém somente amostras distintas (sem duplicar valores idênticos).
   */
  histories: Record<ProductKey, PriceSnapshot[]>;

  /** Configuração/ponteiro do “arquivo vivo” (opcional) */
  liveFile?: LiveFileMeta | null;
}

/* ──────────────────────────────────────────────────────────────────────────
 *                       UI: seleção/compare e toasts
 * ──────────────────────────────────────────────────────────────────────────*/

export interface CompareSelection {
  /** Chaves dos produtos selecionados para comparar */
  keys: ProductKey[];
}

/** Tipos de toast do projeto */
export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface AppToast {
  kind: ToastKind;
  message: string;
  title?: string;
  /** Identificador opcional para deduplicação */
  id?: string;
}

/* ──────────────────────────────────────────────────────────────────────────
 *                               Type Guards
 * ──────────────────────────────────────────────────────────────────────────*/

export function isAmazonDisabled(
  r: ScrapeResult
): r is ScrapeAmazonDisabled {
  /* @ts-expect-error: propriedade existe apenas quando Amazon está desligada */
  return r && (r as any).disabled === true && r.provider === 'amazon';
}

export function isKabumResult(r: ScrapeResult): r is ScrapeKabumResult {
  return r.provider === 'kabum' && (r as any).disabled !== true;
}

export function isAmazonResult(r: ScrapeResult): r is ScrapeAmazonResult {
  return r.provider === 'amazon' && (r as any).disabled !== true;
}

/* ──────────────────────────────────────────────────────────────────────────
 *                          Helpers (somente tipos)
 * ──────────────────────────────────────────────────────────────────────────*/

/** Monta a chave canônica do produto */
export function makeProductKey(
  provider: Provider,
  idOrAsin: string
): ProductKey {
  return `${provider}:${idOrAsin}` as ProductKey;
}
