import React from 'react';
import { Store, Layers, Truck, FileText, Bot, ShoppingCart } from 'lucide-react';
import { UserRole } from '../../types';

export interface MobileBottomNavProps {
  activeView: string;
  onSelectView: (view: string) => void;
  currentRole: UserRole;
  cartCount?: number;
  onOpenCart: () => void;
  language?: 'en' | 'hi';
  className?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onSelectView,
  currentRole,
  cartCount = 0,
  onOpenCart,
  language = 'en',
  className = ''
}) => {
  const isFarmer = currentRole === 'farmer';

  const navItems = [
    {
      id: 'marketplace',
      label: language === 'hi' ? 'मंडी' : 'Mandi',
      icon: Store
    },
    {
      id: isFarmer ? 'farmer_dashboard' : 'orders',
      label: isFarmer ? (language === 'hi' ? 'मेरी फसल' : 'My Farm') : (language === 'hi' ? 'ऑर्डर' : 'Orders'),
      icon: isFarmer ? Layers : Truck
    },
    {
      id: 'rfq',
      label: language === 'hi' ? 'थोक RFQ' : 'Bulk RFQ',
      icon: FileText
    },
    {
      id: 'ai_advisor',
      label: language === 'hi' ? 'AI सलाहकार' : 'AI Saathi',
      icon: Bot,
      isAI: true
    }
  ];

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg px-2 py-1 safe-area-pb ${className}`}
      id="mobile-bottom-nav"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              id={`mobile-nav-${item.id}`}
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 min-w-[56px] min-h-[44px] rounded-xl transition-all cursor-pointer select-none relative ${
                isActive
                  ? 'text-emerald-800 font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-700' : 'text-stone-500'}`} />
                {item.isAI && (
                  <span className="absolute -top-1 -right-2 text-[8px] px-1 py-0 bg-amber-400 text-emerald-950 font-black rounded-full shadow-2xs">
                    AI
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Mobile Cart Action */}
        <button
          type="button"
          id="mobile-nav-cart"
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center py-1.5 px-2 min-w-[56px] min-h-[44px] rounded-xl text-stone-600 hover:text-emerald-800 transition-all cursor-pointer select-none relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-amber-400 text-emerald-950 font-extrabold text-[9px] rounded-full flex items-center justify-center shadow-2xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'hi' ? 'कार्ट' : 'Cart'}
          </span>
        </button>
      </div>
    </div>
  );
};
