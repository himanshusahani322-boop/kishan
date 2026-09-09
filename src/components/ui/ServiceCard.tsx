import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface ServiceCardProps {
  title: string;
  hindiTitle?: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
  onClick: () => void;
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  hindiTitle,
  description,
  icon: Icon,
  tag,
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`group p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Icon className="w-5 h-5" />
          </div>
          {tag && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {tag}
            </span>
          )}
        </div>

        <h3 className="font-bold text-stone-900 text-sm group-hover:text-emerald-700 transition-colors font-display">
          {title}
        </h3>
        {hindiTitle && (
          <p className="text-xs text-stone-400 font-medium">{hindiTitle}</p>
        )}
        <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
        <span>Explore Service</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
