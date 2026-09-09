import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  hindiLabel?: string;
  icon?: React.ReactNode;
  count?: number;
  badge?: string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'pills' | 'underline' | 'segmented';
  className?: string;
  size?: 'sm' | 'md';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className = '',
  size = 'md'
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs sm:text-sm gap-2 font-semibold'
  };

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200 overflow-x-auto no-scrollbar ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`flex items-center rounded-lg transition-all select-none ${sizeStyles[size]} ${
                isActive
                  ? 'bg-white text-stone-950 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-200 text-stone-700'}`}>
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-400 text-emerald-950">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'underline') {
    return (
      <div className={`flex items-center gap-4 border-b border-stone-200 overflow-x-auto no-scrollbar ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 pb-3 pt-1 border-b-2 font-bold text-xs sm:text-sm transition-all select-none whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-emerald-700 text-emerald-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[11px] px-1.5 py-0.2 rounded-full font-bold bg-stone-100 text-stone-700">
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-400 text-emerald-950">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default 'pills'
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={`flex items-center rounded-full font-bold shrink-0 transition-all select-none cursor-pointer ${sizeStyles[size]} ${
              isActive
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-stone-200 text-stone-600'}`}>
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-emerald-950">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
