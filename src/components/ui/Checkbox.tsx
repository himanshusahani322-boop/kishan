import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string | React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  error,
  className = '',
  id,
  checked,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex items-start gap-2.5">
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          className={`peer sr-only ${className}`}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer select-none
            ${disabled ? 'cursor-not-allowed bg-stone-100 border-stone-300 opacity-60' : 'hover:border-emerald-600'}
            peer-checked:bg-emerald-600 peer-checked:border-emerald-600 peer-focus:ring-2 peer-focus:ring-emerald-500/20
            ${error ? 'border-red-500 bg-red-50' : 'border-stone-300 bg-white'}
          `}
        >
          <Check className="w-3.5 h-3.5 text-white stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
        </label>
      </div>

      {(label || description) && (
        <div className="text-sm">
          {label && (
            <label htmlFor={inputId} className={`font-medium select-none cursor-pointer ${disabled ? 'text-stone-400' : 'text-stone-800'}`}>
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-stone-500 mt-0.5">{description}</p>
          )}
          {error && (
            <p className="text-xs text-red-600 mt-0.5 font-medium">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
