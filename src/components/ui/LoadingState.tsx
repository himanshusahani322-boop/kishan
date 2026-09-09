import React from 'react';
import { Sprout, Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  subtext?: string;
  variant?: 'spinner' | 'skeleton' | 'sprout';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading agricultural data...',
  subtext = 'Synchronizing with e-NAM & APMC registries',
  variant = 'sprout',
  className = ''
}) => {
  if (variant === 'skeleton') {
    return (
      <div className={`space-y-4 animate-pulse ${className}`}>
        <div className="h-28 bg-stone-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 bg-stone-200 rounded-xl" />
          <div className="h-24 bg-stone-200 rounded-xl" />
          <div className="h-24 bg-stone-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-10 flex flex-col items-center justify-center text-center space-y-3 ${className}`}>
      {variant === 'sprout' ? (
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 animate-pulse border border-emerald-300">
            <Sprout className="w-7 h-7" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white">
            <Loader2 className="w-3 h-3 animate-spin" />
          </div>
        </div>
      ) : (
        <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
      )}
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-stone-800">{message}</h4>
        {subtext && <p className="text-xs text-stone-500">{subtext}</p>}
      </div>
    </div>
  );
};
