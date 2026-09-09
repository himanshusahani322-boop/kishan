import React from 'react';

export interface RadioOption {
  value: string;
  label: string | React.ReactNode;
  description?: string;
  badge?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  error,
  layout = 'vertical',
  className = ''
}) => {
  const layoutClasses = {
    vertical: 'flex flex-col gap-2.5',
    horizontal: 'flex flex-wrap gap-3',
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-3'
  }[layout];

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <span className="block text-sm font-semibold text-stone-700 mb-1">{label}</span>}
      <div className={layoutClasses}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const optId = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optId}
              className={`relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none
                ${isSelected 
                  ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600' 
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'}
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id={optId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  disabled={option.disabled}
                  onChange={() => onChange(option.value)}
                  className="w-4 h-4 text-emerald-600 border-stone-300 focus:ring-emerald-500"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-medium ${isSelected ? 'text-emerald-950 font-semibold' : 'text-stone-800'}`}>
                    {option.label}
                  </span>
                  {option.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      {option.badge}
                    </span>
                  )}
                </div>
                {option.description && (
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{option.description}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
