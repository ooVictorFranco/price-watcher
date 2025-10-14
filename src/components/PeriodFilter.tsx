// src/components/PeriodFilter.tsx
'use client';

import { motion } from 'framer-motion';

export type Period = 'today' | '3days' | '1week' | '1month' | '3months' | '6months';

type Props = {
  value: Period;
  onChange: (period: Period) => void;
};

const periods: Array<{ value: Period; label: string }> = [
  { value: 'today', label: 'Hoje' },
  { value: '3days', label: '3 dias' },
  { value: '1week', label: '1 semana' },
  { value: '1month', label: '1 mês' },
  { value: '3months', label: '3 meses' },
  { value: '6months', label: '6 meses' },
];

export default function PeriodFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600">Período:</span>
      <div className="flex flex-wrap gap-1">
        {periods.map(period => {
          const isActive = value === period.value;
          return (
            <motion.button
              key={period.value}
              type="button"
              onClick={() => onChange(period.value)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium
                transition-colors duration-200
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {period.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
