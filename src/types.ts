// src/types.ts
export type Snapshot = {
  timestamp: number;
  priceVista?: number | null;
  priceParcelado?: number | null;
  priceOriginal?: number | null;
};

export type ProductInfo = {
  idOrUrl: string;
  name?: string | null;
  image?: string | null;
  lastCheck: number;
  installmentsCount?: number | null;
  installmentsValue?: number | null;
};

export type ApiResponse = {
  name?: string | null;
  image?: string | null;
  priceVista?: number | null;
  priceParcelado?: number | null;
  priceOriginal?: number | null;
  installmentsCount?: number | null;
  installmentsValue?: number | null;
  resolvedUrl: string;
};

export type SearchResult = {
  id: string;           // id numérico KaBuM!
  name: string;
  image?: string | null;
};

export type Favorite = {
  id: string;
  name: string;
  image?: string | null;
  addedAt: number;
};
