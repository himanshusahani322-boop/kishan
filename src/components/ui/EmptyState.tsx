import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
  id = 'empty-state-card'
}) => {
  return (
    <div
      id={id}
      className={`bg-white rounded-2xl p-10 sm:p-14 text-center border border-stone-200 shadow-xs flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto my-6 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 border border-stone-200/80 shrink-0">
        {icon || <PackageOpen className="w-8 h-8 text-stone-400" />}
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base sm:text-lg font-extrabold text-stone-800 font-display">
          {title}
        </h3>
        {description && (
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-medium">
            {description}
          </p>
        )}
      </div>

      {(actionText || secondaryActionText) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {actionText && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionText}
            </Button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
