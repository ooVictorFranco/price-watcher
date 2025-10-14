// src/components/GroupCompareChart.tsx
'use client';

import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';
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
import { Snapshot, ProductGroup } from '@/types';
import { brl, getHistoryKey, getProviderName } from '@/lib/utils';

ChartJS.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const PALETTE = [
  'rgba(37, 99, 235, 1)',   // blue-600
  'rgba(16, 185, 129, 1)',  // emerald-500
  'rgba(239, 68, 68, 1)',   // red-500
  'rgba(168, 85, 247, 1)',  // purple-500
  'rgba(245, 158, 11, 1)',  // amber-500
  'rgba(2, 132, 199, 1)',   // sky-600
  'rgba(20, 184, 166, 1)',  // teal-500
];

type Props = {
  group: ProductGroup;
  metric: 'vista' | 'parcelado' | 'original';
};

export default function GroupCompareChart({ group, metric }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  // Carrega históricos de todos os produtos do grupo
  const histories: Record<string, Snapshot[]> = {};
  group.productIds.forEach(productId => {
    try {
      const raw = localStorage.getItem(getHistoryKey(productId));
      histories[productId] = raw ? JSON.parse(raw) as Snapshot[] : [];
    } catch {
      histories[productId] = [];
    }
  });

  // Coleta todos os timestamps únicos
  const allTimestamps = new Set<number>();
  Object.values(histories).forEach(history => {
    history.forEach(snap => allTimestamps.add(snap.timestamp));
  });

  const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
  const labels = sortedTimestamps.map((t) => dayjs(t).format('DD/MM HH:mm'));

  // Cria datasets para cada produto
  const datasets = group.productIds.map((productId, index) => {
    const history = histories[productId] || [];
    const historyMap = new Map<number, Snapshot>();
    history.forEach(h => historyMap.set(h.timestamp, h));

    // Detecta provider baseado no ID
    const provider: 'kabum' | 'amazon' = /^\d+$/.test(productId) ? 'kabum' : 'amazon';
    const providerName = getProviderName(provider);

    const values = sortedTimestamps.map((t) => {
      const snap = historyMap.get(t);
      if (!snap) return null;
      if (metric === 'vista') return snap.priceVista ?? null;
      if (metric === 'parcelado') return snap.priceParcelado ?? null;
      return snap.priceOriginal ?? null;
    });

    return {
      label: `${providerName} (${productId})`,
      data: values,
      borderWidth: 2,
      tension: 0.25,
      borderColor: PALETTE[index % PALETTE.length],
      pointBackgroundColor: PALETTE[index % PALETTE.length],
      pointBorderColor: PALETTE[index % PALETTE.length],
      pointRadius: 3,
      pointHoverRadius: 5,
    };
  });

  useEffect(() => {
    if (!canvasRef.current || !sortedTimestamps.length) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'nearest', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#374151', usePointStyle: true, pointStyle: 'line' }
          },
          tooltip: {
            mode: 'nearest',
            intersect: false,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${brl(Number(ctx.parsed.y))}`
            },
          },
        },
        scales: {
          x: { ticks: { color: '#6b7280' }, grid: { color: '#f3f4f6' } },
          y: {
            ticks: {
              color: '#6b7280',
              callback: (v) => brl(Number(v))
            },
            grid: { color: '#f3f4f6' }
          },
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
  }, [labels, datasets, sortedTimestamps.length]);

  if (sortedTimestamps.length === 0) {
    return (
      <div className="rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 p-4">
        <p className="text-sm text-gray-500 text-center">
          Sem dados de histórico disponíveis para este grupo.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 p-4 h-80 border border-gray-100">
      <canvas ref={canvasRef} />
    </div>
  );
}
