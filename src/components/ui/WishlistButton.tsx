import React from 'react';
import { Heart } from 'lucide-react';

export interface WishlistButtonProps {
  isWishlisted: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  isWishlisted,
  onToggle,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2'
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size];

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      className={`rounded-full transition-all flex items-center justify-center cursor-pointer shadow-xs ${
        isWishlisted
          ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 scale-105'
          : 'bg-white/90 text-stone-500 hover:text-rose-600 hover:bg-white border border-stone-200'
      } ${sizeClasses} ${className}`}
    >
      <Heart
        className={`${iconSizes} transition-transform active:scale-90 ${
          isWishlisted ? 'fill-rose-500 text-rose-500' : ''
        }`}
      />
    </button>
  );
};
