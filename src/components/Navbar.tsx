import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MandiPriceItem } from '../types';
import { AppHeader } from './ui';

// Keep the header in demo-access mode while the login screen is disabled in AppRouter.
// Set to true alongside LOGIN_ENABLED in AppRouter to restore normal authentication UI.
const LOGIN_ENABLED = false;

interface NavbarProps {
  onOpenCart: () => void;
  onOpenAuth?: (tab?: 'login' | 'signup') => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenAuth, onOpenProfile }) => {
  const { 
    currentUser, 
    currentRole, 
    setRole, 
    language, 
    setLanguage, 
    cart, 
    notifications, 
    markNotificationAsRead,
    activeView, 
    setActiveView 
  } = useApp();

  const { user, isAuthenticated, logout, switchAccountForRole } = useAuth();
  const [mandiPrices, setMandiPrices] = useState<MandiPriceItem[]>([]);

  useEffect(() => {
    fetch('/api/mandi-prices')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.mandiPrices)) {
          setMandiPrices(data.mandiPrices);
        }
      })
      .catch(err => console.warn('Mandi prices load error:', err));
  }, []);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantityQuintals, 0);

  const handleRoleChange = async (newRole: any) => {
    setRole(newRole);
    if (!LOGIN_ENABLED) return;
    // Also synchronize server-side authentic demo account if user chooses to switch
    await switchAccountForRole(newRole);
  };

  return (
    <AppHeader
      currentUser={user || currentUser}
      currentRole={user?.role || currentRole}
      setRole={handleRoleChange}
      language={language}
      setLanguage={setLanguage}
      mandiPrices={mandiPrices}
      cartCount={cartItemCount}
      onOpenCart={onOpenCart}
      activeView={activeView}
      setActiveView={setActiveView}
      notifications={notifications}
      onMarkNotificationAsRead={markNotificationAsRead}
      isAuthenticated={LOGIN_ENABLED ? isAuthenticated : true}
      onOpenAuth={onOpenAuth}
      onOpenProfile={onOpenProfile}
      onLogout={logout}
    />
  );
};
