import React, { useState } from 'react';
import { 
  TrendingUp, 
  Languages, 
  Bell, 
  ShoppingCart, 
  Menu, 
  X, 
  Store, 
  Layers, 
  Truck, 
  FileText, 
  Bot, 
  Warehouse, 
  Calculator, 
  ShieldCheck,
  User as UserIcon,
  LogIn,
  LogOut,
  ChevronDown,
  Lock,
  RotateCcw
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { DesktopNav, NavItemConfig } from './DesktopNav';
import { User, UserRole, MandiPriceItem, AppNotification } from '../../types';

export interface AppHeaderProps {
  currentUser: User | null;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  mandiPrices: MandiPriceItem[];
  cartCount: number;
  onOpenCart: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  notifications: AppNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  isAuthenticated?: boolean;
  onOpenAuth?: (tab?: 'login' | 'signup') => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  className?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  currentRole,
  setRole,
  language,
  setLanguage,
  mandiPrices,
  cartCount,
  onOpenCart,
  activeView,
  setActiveView,
  notifications,
  onMarkNotificationAsRead,
  isAuthenticated = true,
  onOpenAuth,
  onOpenProfile,
  onLogout,
  className = ''
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  const navItems: NavItemConfig[] = [
    { id: 'marketplace', label: language === 'hi' ? 'मंडी बाज़ार' : 'Marketplace', icon: Store },
    {
      id: currentRole === 'farmer' ? 'farmer_dashboard' : 'orders',
      label: currentRole === 'farmer'
        ? (language === 'hi' ? 'मेरी फ़सल व बिक्री' : 'My Farm & Crops')
        : (language === 'hi' ? 'मेरे ऑर्डर' : 'My Orders'),
      icon: currentRole === 'farmer' ? Layers : Truck
    },
    { id: 'rfq', label: language === 'hi' ? 'थोक मांग व सौदे (RFQ)' : 'Bulk Bidding (RFQ)', icon: FileText },
    { id: 'ai_advisor', label: language === 'hi' ? 'कृषि AI सलाहकार' : 'Krishi AI Saathi', icon: Bot, badge: 'AI' },
    { id: 'cold_storage', label: language === 'hi' ? 'कोल्ड स्टोरेज' : 'Cold Storage', icon: Warehouse },
    { id: 'calculators', label: language === 'hi' ? 'कृषि कैलकुलेटर' : 'Agri Calculators', icon: Calculator },
    ...(currentRole === 'admin'
      ? [{ id: 'admin', label: language === 'hi' ? 'एडमिन पोर्टल' : 'Admin Panel', icon: ShieldCheck }]
      : [])
  ];

  return (
    <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-2xs ${className}`}>
      {/* Live Mandi Bhav Ticker */}
      <div className="bg-emerald-900 text-white text-xs py-1.5 px-4 overflow-hidden border-b border-emerald-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0 font-semibold text-emerald-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">LIVE MANDI RATES (आज का मंडी भाव):</span>
            <span className="sm:hidden">MANDI LIVE:</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap text-stone-200">
            {mandiPrices.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                <span className="font-medium text-white">{language === 'hi' ? item.hindiName : item.commodity}:</span>
                <span className="text-emerald-200 font-semibold">₹{item.modalPrice.toLocaleString('en-IN')}/Qtl</span>
                <span className={`text-[10px] font-bold ${item.changePercentage >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {item.changePercentage >= 0 ? `+${item.changePercentage}%` : `${item.changePercentage}%`}
                </span>
                <span className="text-emerald-500 text-[10px]">({item.mandi})</span>
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0 text-[11px] text-emerald-300/80">
            <span>Govt. e-NAM & APMC Synchronized</span>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Area */}
          <BrandLogo
            size="md"
            onClick={() => setActiveView('marketplace')}
          />

          {/* Desktop Navigation */}
          <DesktopNav
            items={navItems}
            activeId={activeView}
            onSelect={(id) => setActiveView(id)}
          />

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-300 transition-colors cursor-pointer"
              title="Toggle Hindi / English"
              id="lang-toggle-btn"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {/* Role Switcher */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  currentRole === 'farmer'
                    ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-emerald-900'
                }`}
                title="Switch to Farmer mode"
                id="role-btn-farmer"
              >
                🌾 Farmer
              </button>
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  currentRole === 'buyer'
                    ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-emerald-900'
                }`}
                title="Switch to Wholesale Buyer mode"
                id="role-btn-buyer"
              >
                🛒 Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`px-2 py-1 rounded-md transition-all hidden sm:block cursor-pointer ${
                  currentRole === 'admin'
                    ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-emerald-900'
                }`}
                title="Switch to Platform Admin mode"
                id="role-btn-admin"
              >
                🛡️ Admin
              </button>
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                id="notif-bell-btn"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-emerald-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-stone-200 z-50 p-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                    <span className="font-bold text-sm text-stone-900">Notifications ({unreadNotifs.length} new)</span>
                    <button
                      type="button"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-stone-500 text-center py-4">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onMarkNotificationAsRead(n.id);
                          }}
                          className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors border ${
                            n.isRead ? 'bg-stone-50 border-stone-100 text-stone-600' : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold mb-1">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-stone-400">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
              id="cart-action-btn"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'hi' ? 'कार्ट' : 'Cart'}</span>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-emerald-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                  {cartCount} Qtl
                </span>
              )}
            </button>

            {/* Authenticated User Menu or Guest Sign In */}
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs font-bold text-stone-800 transition-colors cursor-pointer"
                  id="user-profile-menu-btn"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-md object-cover border border-emerald-600"
                    referrerPolicy="no-referrer"
                  />
                  <span className="hidden md:inline max-w-[90px] truncate">{currentUser.name.split(' ')[0]}</span>
                  <span className="hidden sm:inline uppercase text-[9px] px-1 py-0.2 bg-emerald-200 text-emerald-900 rounded font-black">
                    {currentUser.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 z-50 p-2 animate-in fade-in slide-in-from-top-2 text-xs">
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100 mb-2">
                      <div className="font-bold text-stone-900 truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-stone-500 truncate">{currentUser.email}</div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded border border-emerald-300 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          {currentUser.role}
                        </span>
                        <span className="text-[10px] text-stone-400">★ {currentUser.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenProfile) onOpenProfile();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-md font-semibold text-left cursor-pointer"
                        id="header-open-profile-btn"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{language === 'hi' ? 'मेरी प्रोफ़ाइल व मंडी केंद्र' : 'My Profile & Details'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onLogout) onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-rose-700 hover:bg-rose-50 rounded-md font-semibold text-left cursor-pointer border-t border-stone-100"
                        id="header-logout-btn"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>{language === 'hi' ? 'लॉग आउट (Sign Out)' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                id="header-signin-btn"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'hi' ? 'लॉग इन' : 'Sign In'}</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
              id="mobile-menu-toggle"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 py-3 space-y-1.5 animate-in fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer ${
                  isActive ? 'bg-emerald-700 text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-400 text-emerald-950 font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            {isAuthenticated && currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onOpenProfile) onOpenProfile();
                  }}
                  className="flex items-center gap-2 text-stone-800 font-bold hover:underline cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{currentUser.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="text-rose-600 hover:text-rose-800 font-bold text-[11px] cursor-pointer"
                >
                  {language === 'hi' ? 'लॉग आउट' : 'Sign Out'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenAuth) onOpenAuth('login');
                }}
                className="w-full py-2 text-center bg-emerald-700 text-white rounded-lg font-bold text-xs"
              >
                {language === 'hi' ? 'लॉग इन / नया खाता' : 'Sign In / Register'}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
