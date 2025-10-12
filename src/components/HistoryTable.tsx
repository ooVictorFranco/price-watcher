// src/components/HistoryTable.tsx
'use client';

import { Snapshot } from '@/types';
import { brl } from '@/lib/utils';
import dayjs from 'dayjs';

type Props = {
  history: Snapshot[];
};

export default function HistoryTable({ history }: Props) {
  return (
    <div className="rounded-2xl border bg-white shadow-md p-5">
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Data</th>
              <th className="py-2 pr-4">À vista</th>
              <th className="py-2 pr-4">Parcelado</th>
              <th className="py-2 pr-4">Original</th>
            </tr>
          </thead>
          <tbody>
            {history.slice().reverse().map((row) => (
              <tr key={row.timestamp} className="border-b last:border-0">
                <td className="py-2 pr-4">{dayjs(row.timestamp).format('DD/MM/YYYY HH:mm')}</td>
                <td className="py-2 pr-4">{brl(row.priceVista)}</td>
                <td className="py-2 pr-4">{brl(row.priceParcelado)}</td>
                <td className="py-2 pr-4">{brl(row.priceOriginal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
