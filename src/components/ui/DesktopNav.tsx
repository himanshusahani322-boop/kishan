import React from 'react';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  count?: number;
}

export interface DesktopNavProps {
  items: NavItemConfig[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({
  items,
  activeId,
  onSelect,
  className = ''
}) => {
  return (
    <nav className={`hidden lg:flex items-center gap-1 ${className}`} aria-label="Main Navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;

        return (
          <button
            key={item.id}
            type="button"
            id={`nav-${item.id}`}
            onClick={() => onSelect(item.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 select-none cursor-pointer ${
              isActive
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-100'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-500'}`} />
            <span>{item.label}</span>
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-400 text-emerald-950 font-bold rounded-full">
                {item.badge}
              </span>
            )}
            {item.count !== undefined && item.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-700'
              }`}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
