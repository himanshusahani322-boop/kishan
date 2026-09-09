import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onHomeClick?: () => void;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  onHomeClick,
  className = ''
}) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-1 text-xs text-stone-500 overflow-x-auto no-scrollbar py-1 ${className}`}>
      {onHomeClick && (
        <button
          type="button"
          onClick={onHomeClick}
          className="flex items-center gap-1 hover:text-emerald-800 transition-colors cursor-pointer select-none"
          title="Home"
        >
          <Home className="w-3.5 h-3.5 text-stone-400" />
          <span className="hidden sm:inline font-medium">Home</span>
        </button>
      )}

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1 || item.isActive;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
            {isLast ? (
              <span className="font-bold text-stone-900 truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-emerald-800 font-medium transition-colors truncate max-w-[150px] cursor-pointer"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
