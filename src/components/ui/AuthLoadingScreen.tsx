import React from 'react';
import { BrandLogo } from './BrandLogo';

export const AuthLoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center gap-5 text-stone-600 selection:bg-emerald-200">
    <BrandLogo size="lg" />
    <div className="flex flex-col items-center gap-3">
      {/* Spinner */}
      <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-emerald-600 animate-spin" />
      <p className="text-xs font-semibold text-stone-500 tracking-wide">
        Verifying session…
      </p>
    </div>
  </div>
);
