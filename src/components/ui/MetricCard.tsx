import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive: boolean;
    label?: string;
  };
  iconColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'stone';
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
  iconColor = 'emerald',
  onClick,
  className = ''
}) => {
  const iconTints = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    stone: 'bg-stone-100 text-stone-700 border-stone-200'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-2 transition-all ${
        onClick ? 'cursor-pointer hover:border-emerald-400 hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
        <span>{title}</span>
        {icon && (
          <div className={`p-2 rounded-lg border shrink-0 ${iconTints[iconColor]}`}>
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl font-black text-stone-900 font-display tracking-tight">
          {value}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-stone-100">
        {trend ? (
          <div className="flex items-center gap-1 font-bold">
            {trend.isPositive ? (
              <span className="flex items-center gap-0.5 text-emerald-700">
                <TrendingUp className="w-3.5 h-3.5" />
                +{trend.value}
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-rose-700">
                <TrendingDown className="w-3.5 h-3.5" />
                -{trend.value}
              </span>
            )}
            {trend.label && <span className="text-stone-400 font-normal">{trend.label}</span>}
          </div>
        ) : subtext ? (
          <span className="text-[11px] text-stone-500 line-clamp-1">{subtext}</span>
        ) : null}
      </div>
    </div>
  );
};
