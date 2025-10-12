// src/components/HistoryChart.tsx
'use client';

import { Snapshot } from '@/types';
import { brl } from '@/lib/utils';
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

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const COLOR_VISTA = 'rgba(37, 99, 235, 1)';   // blue-600
const COLOR_PARC = 'rgba(16, 185, 129, 1)';  // emerald-500
const COLOR_ORIG = 'rgba(107, 114, 128, 1)'; // gray-500

type Props = {
  history: Snapshot[];
};

export default function HistoryChart({ history }: Props) {
  const labels = history.map(h => dayjs(h.timestamp).format('DD/MM HH:mm'));
  const vista = history.map(h => h.priceVista ?? null);
  const parce = history.map(h => h.priceParcelado ?? null);
  const orig = history.map(h => h.priceOriginal ?? null);

  const datasets: any[] = [
    { label: 'À vista (PIX)', data: vista, borderWidth: 2, tension: 0.25, borderColor: COLOR_VISTA, pointBackgroundColor: COLOR_VISTA, pointBorderColor: COLOR_VISTA, pointRadius: 3, pointHoverRadius: 5 },
    { label: 'Parcelado (total)', data: parce, borderWidth: 2, tension: 0.25, borderColor: COLOR_PARC, pointBackgroundColor: COLOR_PARC, pointBorderColor: COLOR_PARC, pointRadius: 3, pointHoverRadius: 5 },
  ];
  if (orig.some(v => v != null)) {
    datasets.push({ label: 'Preço original', data: orig, borderWidth: 2, tension: 0.25, borderColor: COLOR_ORIG, pointBackgroundColor: COLOR_ORIG, pointBorderColor: COLOR_ORIG, borderDash: [6, 6], pointRadius: 3, pointHoverRadius: 5 });
  }

  return (
    <div className="rounded-2xl border bg-white shadow-md p-5">
      <h3 className="text-sm font-medium mb-3">Histórico</h3>
      <div className="rounded-xl bg-white p-2 h-80">
        <Line
          data={{ labels, datasets }}
          options={{
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
          }}
        />
      </div>
    </div>
  );
}
