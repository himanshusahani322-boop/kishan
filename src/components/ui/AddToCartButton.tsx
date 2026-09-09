import React from 'react';
import { ShoppingCart, Check } from 'lucide-react';

export interface AddToCartButtonProps {
  onClick: (e: React.MouseEvent) => void;
  isInCart?: boolean;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  onClick,
  isInCart = false,
  disabled = false,
  loading = false,
  label,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-base rounded-xl gap-2.5'
  }[size];

  const defaultText = isInCart ? 'In Cart' : 'Add to Cart';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`font-semibold inline-flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${
        isInCart
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
          : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
      } ${sizeClasses} ${className}`}
    >
      {isInCart ? (
        <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
      ) : (
        <ShoppingCart className="w-4 h-4 shrink-0" />
      )}
      <span>{label || defaultText}</span>
    </button>
  );
};
