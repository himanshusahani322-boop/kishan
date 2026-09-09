import React from 'react';
import { TrendingDown, TrendingUp, Check } from 'lucide-react';

export interface PriceDisplayProps {
  amount: number;
  unit?: string;
  mandiBenchmarkPrice?: number;
  mspPrice?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showMandiComparison?: boolean;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  unit = '/ Quintal',
  mandiBenchmarkPrice,
  mspPrice,
  size = 'md',
  showMandiComparison = true,
  className = ''
}) => {
  const sizeStyles = {
    sm: {
      price: 'text-base font-extrabold',
      unit: 'text-[10px]'
    },
    md: {
      price: 'text-xl font-extrabold',
      unit: 'text-xs'
    },
    lg: {
      price: 'text-2xl font-black',
      unit: 'text-xs'
    },
    xl: {
      price: 'text-3xl font-black',
      unit: 'text-sm'
    }
  };

  const diff = mandiBenchmarkPrice ? amount - mandiBenchmarkPrice : null;
  const isBelowMandi = diff !== null && diff < 0;
  const isAboveMandi = diff !== null && diff > 0;
  const absDiff = diff !== null ? Math.abs(diff) : 0;

  return (
    <div className={`space-y-0.5 ${className}`}>
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className={`text-emerald-950 font-display tracking-tight ${sizeStyles[size].price}`}>
          ₹{amount.toLocaleString('en-IN')}
        </span>
        {unit && (
          <span className={`text-stone-500 font-medium ${sizeStyles[size].unit}`}>
            {unit}
          </span>
        )}
      </div>

      {showMandiComparison && mandiBenchmarkPrice && (
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-stone-400 font-medium">Mandi Bhav:</span>
          <span className="font-semibold text-stone-700">₹{mandiBenchmarkPrice.toLocaleString('en-IN')}</span>
          {diff !== null && (
            <span
              className={`inline-flex items-center gap-0.5 font-bold ${
                isBelowMandi
                  ? 'text-emerald-700'
                  : isAboveMandi
                  ? 'text-amber-700'
                  : 'text-stone-500'
              }`}
            >
              {isBelowMandi ? (
                <>
                  <TrendingDown className="w-3 h-3" />
                  <span>₹{absDiff} below benchmark</span>
                </>
              ) : isAboveMandi ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  <span>+₹{absDiff} premium</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  <span>At benchmark</span>
                </>
              )}
            </span>
          )}
        </div>
      )}

      {mspPrice && (
        <div className="text-[10px] text-stone-400 font-medium">
          Govt. MSP: <strong className="text-stone-600">₹{mspPrice.toLocaleString('en-IN')}</strong>
        </div>
      )}
    </div>
  );
};
