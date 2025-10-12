// src/components/HistoryChart.tsx
'use client';

import { Snapshot } from '@/types';
import { brl } from '@/lib/utils';
import dayjs from 'dayjs';
import { useEffect, useRef, useMemo } from 'react';
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

ChartJS.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const COLOR_VISTA = 'rgba(37, 99, 235, 1)';   // blue-600
const COLOR_PARC = 'rgba(16, 185, 129, 1)';  // emerald-500
const COLOR_ORIG = 'rgba(107, 114, 128, 1)'; // gray-500

type Props = {
  history: Snapshot[];
};

export default function HistoryChart({ history }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  const labels = useMemo(() => history.map(h => dayjs(h.timestamp).format('DD/MM HH:mm')), [history]);
  const vista = useMemo(() => history.map(h => h.priceVista ?? null), [history]);
  const parce = useMemo(() => history.map(h => h.priceParcelado ?? null), [history]);
  const orig = useMemo(() => history.map(h => h.priceOriginal ?? null), [history]);

  const datasets = useMemo(() => {
    const result: Array<{
      label: string;
      data: (number | null)[];
      borderWidth: number;
      tension: number;
      borderColor: string;
      pointBackgroundColor: string;
      pointBorderColor: string;
      pointRadius: number;
      pointHoverRadius: number;
      borderDash?: number[];
    }> = [
      { label: 'À vista (PIX)', data: vista, borderWidth: 2, tension: 0.25, borderColor: COLOR_VISTA, pointBackgroundColor: COLOR_VISTA, pointBorderColor: COLOR_VISTA, pointRadius: 3, pointHoverRadius: 5 },
      { label: 'Parcelado (total)', data: parce, borderWidth: 2, tension: 0.25, borderColor: COLOR_PARC, pointBackgroundColor: COLOR_PARC, pointBorderColor: COLOR_PARC, pointRadius: 3, pointHoverRadius: 5 },
    ];
    if (orig.some(v => v != null)) {
      result.push({ label: 'Preço original', data: orig, borderWidth: 2, tension: 0.25, borderColor: COLOR_ORIG, pointBackgroundColor: COLOR_ORIG, pointBorderColor: COLOR_ORIG, borderDash: [6, 6], pointRadius: 3, pointHoverRadius: 5 });
    }
    return result;
  }, [vista, parce, orig]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#374151', usePointStyle: true, pointStyle: 'line' },
          },
          tooltip: { mode: 'index', intersect: false },
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

  return (
    <div className="rounded-2xl border bg-white shadow-md p-5">
      <h3 className="text-sm font-medium mb-3">Histórico</h3>
      <div className="rounded-xl bg-white p-2 h-80">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
