import React from 'react';
import { Sprout } from 'lucide-react';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  showHindiBadge?: boolean;
  onClick?: () => void;
  className?: string;
  id?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  showHindiBadge = true,
  onClick,
  className = '',
  id = 'logo-brand'
}) => {
  const iconSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl'
  };

  const iconSvgSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''} ${className}`}
    >
      <div className={`${iconSizes[size]} bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-xs ring-2 ring-emerald-600/20 shrink-0`}>
        <Sprout className={`${iconSvgSizes[size]} text-emerald-100`} />
      </div>
      <div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-extrabold ${titleSizes[size]} tracking-tight text-emerald-950 font-display`}>
            KISAN SAATHI
          </span>
          {showHindiBadge && (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded border border-amber-300/60 font-sans">
              किसान साथी
            </span>
          )}
        </div>
        {showTagline && (
          <p className="text-[11px] text-stone-500 font-medium hidden sm:block leading-tight">
            National Agriculture Direct Trade & FPO Network
          </p>
        )}
      </div>
    </div>
  );
};
