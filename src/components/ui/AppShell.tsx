import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../Navbar';
import { MobileHeader } from './MobileHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Toast } from './Toast';
import { AIAssistantButton } from './AIAssistantButton';
import { CartCheckoutModal } from '../CartCheckoutModal';
import { UserProfileModal } from '../auth/UserProfileModal';
import { AuthModal } from '../auth/AuthModal';
import { ShieldCheck, Phone } from 'lucide-react';

export interface AppShellProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
  showBack?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  showSidebar = false,
  pageTitle,
  pageSubtitle,
  showBack = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    currentRole, 
    cart, 
    toastMessage, 
    dismissToast, 
    language,
    notifications 
  } = useApp();
  const { user } = useAuth();

  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  const cartCount = cart.reduce((sum, item) => sum + item.quantityQuintals, 0);
  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  const isAuthPage = location.pathname.startsWith('/login') || 
                     location.pathname.startsWith('/signup') || 
                     location.pathname.startsWith('/role-selection');

  const isFarmerRoute = location.pathname.startsWith('/farmer');
  const isBuyerRoute = location.pathname.startsWith('/buyer');
  const isAIPage = location.pathname === '/farmer/ai';

  // Map route to activeView key for MobileBottomNav compatibility
  const getActiveViewFromPath = (): string => {
    const p = location.pathname;
    if (p.includes('/marketplace') || p === '/buyer') return 'marketplace';
    if (p.includes('/seller-window') || p === '/farmer') return 'farmer_dashboard';
    if (p.includes('/bulk-requirements')) return 'rfq';
    if (p.includes('/orders') || p.includes('/tracking')) return 'orders';
    if (p.includes('/cold-storage')) return 'cold_storage';
    if (p.includes('/calculations')) return 'calculators';
    if (p.includes('/ai')) return 'ai_advisor';
    if (p.includes('/admin')) return 'admin';
    return 'marketplace';
  };

  const handleSelectMobileView = (view: string) => {
    switch (view) {
      case 'marketplace':
        navigate('/buyer/marketplace');
        break;
      case 'farmer_dashboard':
        navigate('/farmer');
        break;
      case 'orders':
        navigate(currentRole === 'farmer' ? '/farmer/orders' : '/buyer/orders');
        break;
      case 'rfq':
        navigate('/buyer/bulk-requirements');
        break;
      case 'cold_storage':
        navigate('/farmer/cold-storage');
        break;
      case 'calculators':
        navigate('/farmer/calculations');
        break;
      case 'ai_advisor':
        navigate('/farmer/ai');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900 selection:bg-emerald-200">
      {/* Toast Alert */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onDismiss={dismissToast}
        />
      )}

      {/* Top Navbar for Desktop */}
      {!isAuthPage && (
        <Navbar 
          onOpenCart={() => setIsCartModalOpen(true)}
          onOpenAuth={(tab = 'login') => {
            setAuthModalTab(tab);
            setIsAuthModalOpen(true);
          }}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />
      )}

      {/* Mobile Top Header */}
      {!isAuthPage && (
        <MobileHeader
          title={pageTitle}
          subtitle={pageSubtitle}
          showBack={showBack || location.pathname !== '/' && location.pathname !== '/buyer' && location.pathname !== '/farmer'}
          showSearch={location.pathname.includes('/marketplace')}
          cartCount={cartCount}
          onCartClick={() => setIsCartModalOpen(true)}
          notificationCount={unreadNotifs}
          onNotificationClick={() => {}}
          roleBadge={currentRole === 'farmer' ? 'किसान' : currentRole === 'buyer' ? 'थोक खरीदार' : 'एडमिन'}
        />
      )}

      {/* Main Container with Optional Sidebar */}
      <div className="flex-1 flex w-full">
        {showSidebar && !isAuthPage && (
          <DesktopSidebar 
            role={currentRole} 
            language={language}
          />
        )}

        <main className="flex-1 w-full min-w-0 pb-20 md:pb-10">
          {children}
        </main>
      </div>

      {/* Floating Krishi AI Assistant Button */}
      {!isAuthPage && !isAIPage && (
        <AIAssistantButton
          onClick={() => navigate('/farmer/ai')}
        />
      )}

      {/* Mobile Bottom Navigation */}
      {!isAuthPage && (
        <MobileBottomNav
          activeView={getActiveViewFromPath()}
          onSelectView={handleSelectMobileView}
          currentRole={user?.role || currentRole}
          cartCount={cartCount}
          onOpenCart={() => setIsCartModalOpen(true)}
          language={language}
        />
      )}

      {/* Modals */}
      <CartCheckoutModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        language={language}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
        language={language}
      />

      {/* Desktop Institutional Footer */}
      {!isAuthPage && (
        <footer className="bg-stone-900 text-stone-300 text-xs mt-auto border-t border-stone-800 pb-16 lg:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-amber-300 font-black text-sm flex items-center justify-center font-display">
                    KS
                  </div>
                  <span className="font-extrabold text-white text-base tracking-tight font-display">
                    किसान साथी <span className="text-emerald-400 font-sans text-xs">Kisan Saathi</span>
                  </span>
                </div>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  India's certified digital agriculture exchange empowering farmers, FPOs, and bulk institutional buyers with transparent APMC benchmark pricing, electronic escrow, and door-to-door GPS freight logistics.
                </p>
              </div>

              <div className="space-y-2 text-[11px]">
                <span className="font-bold text-white uppercase tracking-wider block">Institutional Portals</span>
                <ul className="space-y-1 text-stone-400">
                  <li>• e-NAM Inter-Mandi Synchronizer</li>
                  <li>• AGMARK Quality Grade Standards</li>
                  <li>• WDRA Electronic Warehouse Receipts</li>
                  <li>• Agriculture Infrastructure Fund (AIF)</li>
                  <li>• PM-KISAN & DBT Fertilizer Portal</li>
                </ul>
              </div>

              <div className="space-y-2 text-[11px]">
                <span className="font-bold text-white uppercase tracking-wider block">Security & Escrow</span>
                <ul className="space-y-1 text-stone-400">
                  <li>• 100% Pre-funded RBI Escrow Custody</li>
                  <li>• Assayed Weighment at Mandi Gate</li>
                  <li>• Zero Broker Commissions for Farmers</li>
                  <li>• Dispute Resolution Board</li>
                  <li>• Two-Way Transparent Ratings</li>
                </ul>
              </div>

              <div className="space-y-2 text-[11px]">
                <span className="font-bold text-white uppercase tracking-wider block">Kisan Sahayata Helpline</span>
                <div className="p-3 bg-stone-800/80 rounded-xl space-y-1.5 border border-stone-700">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Toll-Free: 1800-180-1551</span>
                  </div>
                  <p className="text-stone-400 text-[10px]">
                    Kisan Call Centre (24x7 Support in 22 regional Indian languages)
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-400 text-[11px]">
              <div>
                © 2026 Kisan Saathi Technologies Ltd. Integrated with National Agriculture Market (e-NAM) standards.
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-bit SSL Encrypted • ISO 9001:2015 Agronomy Quality Assured</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
