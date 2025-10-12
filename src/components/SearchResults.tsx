// src/components/SearchResults.tsx
'use client';

import { SearchResult } from '@/types';
import { kabumSearchUrl, kabumUrlForId } from '@/lib/utils';

type Props = {
  query?: string;
  results: SearchResult[];
  onPick: (id: string) => void;
  onFav: (item: SearchResult) => void;
};

export default function SearchResults({ query, results, onPick, onFav }: Props) {
  return (
    <div className="rounded-2xl border bg-white shadow-md p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Resultados {query ? `para “${query}”` : ''}</h3>
        <span className="text-xs text-gray-500">{results.length} itens</span>
      </div>

      {results.length === 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Nenhum resultado da busca automática. O KaBuM! pode estar renderizando a lista no cliente.
          </p>
          {query && (
            <a
              href={kabumSearchUrl(query)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm border hover:bg-gray-50"
            >
              Abrir busca no KaBuM!
            </a>
          )}
          <p className="text-xs text-gray-500">
            Dica: se você já tem o <strong>ID</strong> do produto, use <em>Monitorar</em> diretamente.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {results.map((r) => (
            <li key={r.id} className="rounded-xl border p-3 flex gap-3">
              {r.image ? (
                <img src={r.image} alt={r.name} className="h-16 w-16 rounded-lg object-contain bg-gray-50" />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-gray-100 grid place-items-center text-lg">📦</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">{r.name}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onPick(r.id)}
                    className="rounded-lg px-3 py-2 text-sm border hover:bg-gray-50"
                  >
                    Monitorar
                  </button>
                  <button
                    onClick={() => onFav(r)}
                    className="rounded-lg px-3 py-2 text-sm border hover:bg-gray-50"
                  >
                    Favoritar
                  </button>
                  <a
                    href={kabumUrlForId(r.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-3 py-2 text-sm border hover:bg-gray-50"
                  >
                    Abrir
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
