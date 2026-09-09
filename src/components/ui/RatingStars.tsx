import React, { useState } from 'react';
import { Star } from 'lucide-react';

export interface RatingStarsProps {
  value: number;
  max?: number;
  isEditable?: boolean;
  onChange?: (score: number) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showScore?: boolean;
  totalRatingsCount?: number;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  max = 5,
  isEditable = false,
  onChange,
  size = 'sm',
  showScore = true,
  totalRatingsCount,
  className = ''
}) => {
  const [hoverScore, setHoverScore] = useState<number | null>(null);

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const currentScore = hoverScore !== null ? hoverScore : value;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, idx) => {
          const starNumber = idx + 1;
          const isFilled = starNumber <= Math.round(currentScore);

          return (
            <button
              key={idx}
              type="button"
              disabled={!isEditable}
              onClick={() => isEditable && onChange && onChange(starNumber)}
              onMouseEnter={() => isEditable && setHoverScore(starNumber)}
              onMouseLeave={() => isEditable && setHoverScore(null)}
              className={`${isEditable ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5`}
              aria-label={`${starNumber} out of ${max} stars`}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-2xs'
                    : 'text-stone-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-xs font-bold text-stone-700">
          ★ {value.toFixed(1)}
        </span>
      )}

      {totalRatingsCount !== undefined && (
        <span className="text-[11px] text-stone-400 font-medium">
          ({totalRatingsCount})
        </span>
      )}
    </div>
  );
};
