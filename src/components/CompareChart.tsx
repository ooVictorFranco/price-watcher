// src/components/CompareChart.tsx
'use client';

import dayjs from 'dayjs';
import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  LineController,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartConfiguration,
} from 'chart.js';
import { Snapshot } from '@/types';
import { brl } from '@/lib/utils';
import PeriodFilter, { Period } from './PeriodFilter';

ChartJS.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const [period, setPeriod] = useState<Period>('6months');

  // Filtra as séries baseado no período
  const filteredSeries = useMemo(() => {
    if (!series || series.length === 0) return [];

    const now = Date.now();
    let cutoffTime = now;

    switch (period) {
      case 'today':
        cutoffTime = new Date().setHours(0, 0, 0, 0);
        break;
      case '3days':
        cutoffTime = now - 3 * 24 * 60 * 60 * 1000;
        break;
      case '1week':
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '1month':
        cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case '3months':
        cutoffTime = now - 90 * 24 * 60 * 60 * 1000;
        break;
      case '6months':
        cutoffTime = now - 180 * 24 * 60 * 60 * 1000;
        break;
    }

    return series.map(s => ({
      ...s,
      history: s.history.filter(h => h.timestamp >= cutoffTime),
    }));
  }, [series, period]);

  const union = filteredSeries.length ? unionSortedTimestamps(filteredSeries) : [];
  const labels = union.map((t) => dayjs(t).format('DD/MM HH:mm'));

  const datasets = filteredSeries.map((s) => {
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

  useEffect(() => {
    if (!canvasRef.current) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: { labels, datasets },
      options: {
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
      },
    };

    if (chartRef.current) {
      chartRef.current.data = { labels, datasets };
      chartRef.current.update();
    } else {
      chartRef.current = new ChartJS(canvasRef.current, config);
    }

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [labels, datasets]);

  if (!series.length) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/40 shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          Comparativo de Preços
        </h3>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>
      <div className="rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 p-4 h-80 border border-gray-100">
        <canvas ref={canvasRef} />
      </div>
      {union.length === 0 && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Nenhum dado disponível para o período selecionado
        </p>
      )}
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
