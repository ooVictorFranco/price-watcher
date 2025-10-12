// src/components/CompareChart.tsx
'use client';

import dayjs from 'dayjs';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Snapshot } from '@/types';
import { brl } from '@/lib/utils';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

type Series = {
  id: string;
  name: string;
  history: Snapshot[];
  color: string;
  metric: 'vista' | 'parcelado' | 'original';
};

const PALETTE = [
  'rgba(37, 99, 235, 1)',   // blue-600
  'rgba(16, 185, 129, 1)',  // emerald-500
  'rgba(239, 68, 68, 1)',   // red-500
  'rgba(168, 85, 247, 1)',  // purple-500
  'rgba(245, 158, 11, 1)',  // amber-500
  'rgba(2, 132, 199, 1)',   // sky-600
  'rgba(20, 184, 166, 1)',  // teal-500
];

function unionSortedTimestamps(series: Series[]): number[] {
  const set = new Set<number>();
  for (const s of series) for (const h of s.history) set.add(h.timestamp);
  return Array.from(set).sort((a, b) => a - b);
}

export default function CompareChart({ series }: { series: Series[] }) {
  if (!series.length) return null;

  const union = unionSortedTimestamps(series);
  const labels = union.map((t) => dayjs(t).format('DD/MM HH:mm'));

  const datasets = series.map((s) => {
    const map = new Map<number, Snapshot>();
    s.history.forEach(h => map.set(h.timestamp, h));

    const values = union.map((t) => {
      const h = map.get(t);
      if (!h) return null;
      if (s.metric === 'vista') return h.priceVista ?? null;
      if (s.metric === 'parcelado') return h.priceParcelado ?? null;
      return h.priceOriginal ?? null;
    });

    return {
      label: s.name,
      data: values,
      borderWidth: 2,
      tension: 0.25,
      borderColor: s.color,
      pointBackgroundColor: s.color,
      pointBorderColor: s.color,
      pointRadius: 3,
      pointHoverRadius: 5,
    };
  });

  return (
    <div className="rounded-2xl border bg-white shadow-md p-5">
      <h3 className="text-sm font-medium mb-3">Comparativo</h3>
      <div className="rounded-xl bg-white p-2 h-80">
        <Line
          data={{ labels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'nearest', intersect: false },
            plugins: {
              legend: { position: 'top', labels: { color: '#374151', usePointStyle: true, pointStyle: 'line' } },
              tooltip: {
                mode: 'nearest',
                intersect: false,
                callbacks: { label: (ctx) => `${ctx.dataset.label}: ${brl(Number(ctx.parsed.y))}` },
              },
            },
            scales: {
              x: { ticks: { color: '#6b7280' }, grid: { color: '#f3f4f6' } },
              y: { ticks: { color: '#6b7280', callback: (v) => brl(Number(v)) }, grid: { color: '#f3f4f6' } },
            },
          }}
        />
      </div>
    </div>
  );
}

export function makeCompareSeries(
  selIds: string[],
  nameById: Record<string, string>,
  historyById: Record<string, Snapshot[]>,
  metric: 'vista' | 'parcelado' | 'original',
): Series[] {
  return selIds.map((id, i) => ({
    id,
    name: `${nameById[id] ?? id} (${id})`,
    history: (historyById[id] ?? []).slice().sort((a, b) => a.timestamp - b.timestamp),
    color: PALETTE[i % PALETTE.length],
    metric,
  }));
}
