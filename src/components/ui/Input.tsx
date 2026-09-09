import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  containerClassName = '',
  className = '',
  id,
  required,
  disabled,
  ...props
}, ref) => {
  const generatedId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

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
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none shrink-0">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={generatedId}
          required={required}
          disabled={disabled}
          className={`w-full py-2 text-sm rounded-lg bg-stone-50 border transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${
            leftIcon ? 'pl-9' : 'pl-3'
          } ${rightIcon ? 'pr-9' : 'pr-3'} ${
            error 
              ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-200' 
              : 'border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:bg-white'
          } text-stone-900 placeholder:text-stone-400 focus:outline-hidden ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 shrink-0">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-[11px] text-rose-600 font-semibold">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-stone-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
