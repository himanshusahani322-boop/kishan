import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface QuantitySelectorProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  quickPresets?: number[];
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 10000,
  step = 1,
  unit = 'Qtl',
  quickPresets,
  disabled = false,
  className = '',
  id = 'quantity-selector'
}) => {
  const handleDecrement = () => {
    const next = Math.max(min, value - step);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, value + step);
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    if (isNaN(num)) return;
    if (num < min) onChange(min);
    else if (num > max) onChange(max);
    else onChange(num);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 overflow-hidden shadow-2xs">
          <button
            type="button"
            id={`${id}-decrease`}
            disabled={disabled || value <= min}
            onClick={handleDecrement}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>

          <input
            type="number"
            id={id}
            disabled={disabled}
            value={value}
            min={min}
            max={max}
            onChange={handleInputChange}
            className="w-16 sm:w-20 text-center py-1.5 bg-white text-sm font-extrabold text-stone-900 border-x border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-display"
          />

          <button
            type="button"
            id={`${id}-increase`}
            disabled={disabled || value >= max}
            onClick={handleIncrement}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <span className="text-xs font-bold text-stone-600">
          {unit}
        </span>
      </div>

      {quickPresets && quickPresets.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] text-stone-400 font-semibold">Quick add:</span>
          {quickPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={disabled || value + preset > max}
              onClick={() => onChange(Math.min(max, value + preset))}
              className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold border border-stone-200 transition-colors cursor-pointer disabled:opacity-40"
            >
              +{preset} {unit}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
