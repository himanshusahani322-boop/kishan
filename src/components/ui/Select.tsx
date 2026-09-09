import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  helperText,
  error,
  options,
  children,
  containerClassName = '',
  className = '',
  id,
  required,
  disabled,
  ...props
}, ref) => {
  const generatedId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={generatedId} 
          className="block text-xs font-bold text-stone-700 select-none"
        >
          {label}
          {required && <span className="text-rose-600 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={generatedId}
          required={required}
          disabled={disabled}
          className={`w-full appearance-none pl-3 pr-8 py-2 text-sm rounded-lg bg-stone-50 border transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
            error 
              ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-200' 
              : 'border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:bg-white'
          } text-stone-900 focus:outline-hidden ${className}`}
          {...props}
        >
          {options ? (
            options.map(opt => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="text-[11px] text-rose-600 font-semibold">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-stone-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
