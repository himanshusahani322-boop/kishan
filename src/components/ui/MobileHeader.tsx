import React from 'react';
import { ArrowLeft, ShoppingCart, Search, Bell, Shield, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

export interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearchClick?: () => void;
  cartCount?: number;
  onCartClick?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
  rightAction?: React.ReactNode;
  roleBadge?: string;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  showSearch = false,
  onSearchClick,
  cartCount = 0,
  onCartClick,
  notificationCount = 0,
  onNotificationClick,
  rightAction,
  roleBadge,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xs ${className}`}>
      <div className="flex items-center gap-2.5 min-w-0">
        {showBack ? (
          <button
            onClick={handleBack}
            aria-label="Go Back"
            className="p-1.5 -ml-1.5 rounded-lg text-stone-700 hover:bg-stone-100 active:bg-stone-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <BrandLogo size="sm" showTagline={false} />
        )}

        <div className="min-w-0">
          {title ? (
            <div>
              <h1 className="text-sm font-bold text-stone-900 truncate font-display leading-tight">{title}</h1>
              {subtitle && <p className="text-[10px] text-stone-500 truncate">{subtitle}</p>}
            </div>
          ) : (
            roleBadge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {roleBadge}
              </span>
            )
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {showSearch && (
          <button
            onClick={onSearchClick}
            aria-label="Search"
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 active:bg-stone-200 cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {onCartClick && (
          <button
            onClick={onCartClick}
            aria-label="Cart"
            className="relative p-2 rounded-xl text-stone-600 hover:bg-stone-100 active:bg-stone-200 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute 1 top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        )}

        {onNotificationClick && (
          <button
            onClick={onNotificationClick}
            aria-label="Notifications"
            className="relative p-2 rounded-xl text-stone-600 hover:bg-stone-100 active:bg-stone-200 cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
        )}

        {rightAction}
      </div>
    </div>
  );
};
