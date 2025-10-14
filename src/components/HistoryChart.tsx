// src/components/HistoryChart.tsx
'use client';

import { Snapshot } from '@/types';
import { brl } from '@/lib/utils';
import dayjs from 'dayjs';
import { useEffect, useRef, useMemo, useState } from 'react';
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
import PeriodFilter, { Period } from './PeriodFilter';

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
  const [period, setPeriod] = useState<Period>('6months');

  // Filtra histórico baseado no período selecionado
  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];

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

    return history.filter(h => h.timestamp >= cutoffTime);
  }, [history, period]);

  const labels = useMemo(() => filteredHistory.map(h => dayjs(h.timestamp).format('DD/MM HH:mm')), [filteredHistory]);
  const vista = useMemo(() => filteredHistory.map(h => h.priceVista ?? null), [filteredHistory]);
  const parce = useMemo(() => filteredHistory.map(h => h.priceParcelado ?? null), [filteredHistory]);
  const orig = useMemo(() => filteredHistory.map(h => h.priceOriginal ?? null), [filteredHistory]);

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
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/40 shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Histórico de Preços</h3>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>
      <div className="rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 p-4 h-80 border border-gray-100">
        <canvas ref={canvasRef} />
      </div>
      {filteredHistory.length === 0 && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Nenhum dado disponível para o período selecionado
        </p>
      )}
    </div>
  );
}
