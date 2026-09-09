import React from 'react';
import { ShieldCheck, Award, CheckCircle } from 'lucide-react';

export interface SellerBadgeProps {
  type: 'Individual Farmer' | 'FPO (Farmer Producer Org)' | 'Progressive Grower' | string;
  isVerified?: boolean;
  className?: string;
}

export const SellerBadge: React.FC<SellerBadgeProps> = ({
  type,
  isVerified = true,
  className = ''
}) => {
  const isFPO = type.includes('FPO');
  const isProgressive = type.includes('Progressive');

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
        isFPO
          ? 'bg-amber-50 text-amber-900 border border-amber-200'
          : isProgressive
          ? 'bg-purple-50 text-purple-900 border border-purple-200'
          : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
      } ${className}`}
    >
      {isFPO ? (
        <Award className="w-3 h-3 text-amber-600 shrink-0" />
      ) : isVerified ? (
        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
      ) : (
        <CheckCircle className="w-3 h-3 text-stone-400 shrink-0" />
      )}
      <span className="truncate">{type}</span>
    </span>
  );
};
