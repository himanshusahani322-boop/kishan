import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-150 rounded-lg select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:ring-offset-1 active:scale-[0.99]';

  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'px-2.5 py-1 text-xs gap-1.5',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5 rounded-xl'
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white shadow-xs',
    secondary: 'bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 border border-stone-200',
    outline: 'bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 border border-stone-300',
    ghost: 'bg-transparent hover:bg-stone-100 active:bg-stone-200 text-stone-700',
    danger: 'bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white shadow-xs',
    amber: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 shadow-xs'
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children && <span>{children}</span>}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
