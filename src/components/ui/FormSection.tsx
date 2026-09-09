import React from 'react';

export interface FormSectionProps {
  title?: string;
  description?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  badge,
  children,
  className = ''
}) => {
  return (
    <div className={`p-5 sm:p-6 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-4 ${className}`}>
      {(title || description || badge) && (
        <div className="border-b border-stone-100 pb-3">
          <div className="flex items-center justify-between gap-2">
            {title && <h3 className="text-base font-bold text-stone-900 font-display">{title}</h3>}
            {badge && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {badge}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-stone-500 mt-1">{description}</p>}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};
