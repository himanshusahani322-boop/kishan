import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(({
  variant = 'ghost',
  size = 'md',
  ariaLabel,
  className = '',
  children,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'p-1.5 rounded-lg text-xs',
    md: 'p-2 rounded-xl text-sm',
    lg: 'p-2.5 rounded-xl text-base'
  }[size];

  const variantClasses = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-xs',
    secondary: 'bg-stone-100 text-stone-700 hover:bg-stone-200 active:bg-stone-300',
    outline: 'border border-stone-300 text-stone-700 hover:bg-stone-50 active:bg-stone-100',
    ghost: 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 active:bg-stone-200',
    danger: 'text-red-600 hover:bg-red-50 active:bg-red-100'
  }[variant];

  return (
    <button
      ref={ref}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`inline-flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

IconButton.displayName = 'IconButton';
