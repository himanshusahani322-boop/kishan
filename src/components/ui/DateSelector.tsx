import React from 'react';
import { Calendar } from 'lucide-react';

export interface DateSelectorProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const DateSelector = React.forwardRef<HTMLInputElement, DateSelectorProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type="date"
          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-stone-900
            transition-all focus:outline-none focus:ring-2 bg-white
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-stone-300 focus:border-emerald-600 focus:ring-emerald-600/20 hover:border-stone-400'}
            disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-stone-500">{helperText}</p>}
    </div>
  );
});

DateSelector.displayName = 'DateSelector';
