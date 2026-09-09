import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export interface FarmerStatCardProps {
  title: string;
  hindiTitle?: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ComponentType<{ className?: string }>;
  color?: 'emerald' | 'amber' | 'blue' | 'purple';
  onClick?: () => void;
  className?: string;
}

export const FarmerStatCard: React.FC<FarmerStatCardProps> = ({
  title,
  hindiTitle,
  value,
  unit,
  trend,
  icon: Icon,
  color = 'emerald',
  onClick,
  className = ''
}) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50/80 border-emerald-200/90 text-emerald-950',
      iconBg: 'bg-emerald-600 text-white',
      accent: 'text-emerald-700'
    },
    amber: {
      bg: 'bg-amber-50/80 border-amber-200/90 text-amber-950',
      iconBg: 'bg-amber-600 text-white',
      accent: 'text-amber-700'
    },
    blue: {
      bg: 'bg-blue-50/80 border-blue-200/90 text-blue-950',
      iconBg: 'bg-blue-600 text-white',
      accent: 'text-blue-700'
    },
    purple: {
      bg: 'bg-purple-50/80 border-purple-200/90 text-purple-950',
      iconBg: 'bg-purple-600 text-white',
      accent: 'text-purple-700'
    }
  }[color];

  return (
    <div
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-2xl border transition-all ${colorStyles.bg} shadow-2xs ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
            {title}
          </span>
          {hindiTitle && (
            <span className="text-[11px] font-medium text-stone-400 block">
              {hindiTitle}
            </span>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${colorStyles.iconBg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 font-display">
          {value}
        </span>
        {unit && <span className="text-xs font-semibold text-stone-500">{unit}</span>}
      </div>

      {trend && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
          {trend.isPositive ? (
            <span className="flex items-center text-emerald-700 font-bold">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          ) : (
            <span className="flex items-center text-rose-600 font-bold">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          )}
          <span className="text-stone-400 text-[11px]">vs last mandi cycle</span>
        </div>
      )}
    </div>
  );
};
