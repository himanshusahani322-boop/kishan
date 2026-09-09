import React from 'react';
import { QualityGrade } from '../../types';
import { CheckCheck } from 'lucide-react';

export interface QualityBadgeProps {
  grade: QualityGrade | string;
  isOrganic?: boolean;
  className?: string;
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({
  grade,
  isOrganic = false,
  className = ''
}) => {
  const isAExport = grade.includes('Export') || grade.includes('A+');
  const isAPremium = grade.includes('A (Premium)') || grade === 'Grade A';

  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      <span
        className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
          isAExport
            ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
            : isAPremium
            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            : 'bg-stone-100 text-stone-700 border border-stone-300'
        }`}
      >
        <CheckCheck className="w-3 h-3 text-current" />
        <span>{grade}</span>
      </span>

      {isOrganic && (
        <span className="inline-flex items-center text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-lime-100 text-lime-900 border border-lime-300">
          🌱 Jaivik Bharat (Organic)
        </span>
      )}
    </div>
  );
};
