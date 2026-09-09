import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Layers, 
  Store, 
  Truck, 
  FileText, 
  Bot, 
  Warehouse, 
  Calculator, 
  Newspaper, 
  Sprout, 
  TrendingUp, 
  User, 
  PlusCircle,
  HelpCircle,
  ShieldCheck,
  Package
} from 'lucide-react';
import { UserRole } from '../../types';

export interface SidebarItem {
  id: string;
  label: string;
  hindiLabel?: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface DesktopSidebarProps {
  role: UserRole;
  language: 'en' | 'hi';
  className?: string;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  role,
  language,
  className = ''
}) => {
  const farmerItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Farmer Dashboard', hindiLabel: 'किसान डैशबोर्ड', path: '/farmer', icon: Layers },
    { id: 'seller-window', label: 'Seller Window (My Crops)', hindiLabel: 'मेरी फसलें (बिक्री)', path: '/farmer/seller-window', icon: Package },
    { id: 'add-crop', label: 'List New Harvest', hindiLabel: 'नई फसल जोड़ें', path: '/farmer/seller-window/add', icon: PlusCircle, badge: 'New' },
    { id: 'orders', label: 'Order Dispatch Center', hindiLabel: 'ऑर्डर व प्रेषण', path: '/farmer/orders', icon: Truck },
    { id: 'calculations', label: 'Agri Calculators', hindiLabel: 'कृषि कैलकुलेटर', path: '/farmer/calculations', icon: Calculator },
    { id: 'lifecycle', label: 'Crop Life Cycle', hindiLabel: 'फसल जीवन चक्र', path: '/farmer/crop-life-cycle', icon: Sprout },
    { id: 'news', label: 'Mandi News & Schemes', hindiLabel: 'मंडी समाचार व योजनाएं', path: '/farmer/news', icon: Newspaper },
    { id: 'cold-storage', label: 'Cold Storage Finder', hindiLabel: 'कोल्ड स्टोरेज खोजें', path: '/farmer/cold-storage', icon: Warehouse },
    { id: 'ai-assistant', label: 'Krishi AI Saathi', hindiLabel: 'कृषि AI साथी', path: '/farmer/ai', icon: Bot, badge: 'AI' }
  ];

  const buyerItems: SidebarItem[] = [
    { id: 'buyer-home', label: 'Buyer Home', hindiLabel: 'खरीदार होम', path: '/buyer', icon: Store },
    { id: 'categories', label: 'Commodity Categories', hindiLabel: 'उपज श्रेणियां', path: '/buyer/categories', icon: Layers },
    { id: 'marketplace', label: 'Spot Marketplace', hindiLabel: 'मंडी बाज़ार', path: '/buyer/marketplace', icon: TrendingUp },
    { id: 'bulk-requirements', label: 'Bulk Requirements (RFQ)', hindiLabel: 'थोक मांग (RFQ)', path: '/buyer/bulk-requirements', icon: FileText },
    { id: 'create-requirement', label: 'Post RFQ Demand', hindiLabel: 'नई मांग दर्ज करें', path: '/buyer/bulk-requirements/create', icon: PlusCircle },
    { id: 'orders', label: 'Procurement Orders', hindiLabel: 'मेरे ऑर्डर', path: '/buyer/orders', icon: Truck },
    { id: 'cart', label: 'Procurement Cart', hindiLabel: 'खरीद कार्ट', path: '/buyer/cart', icon: Package },
    { id: 'profile', label: 'Enterprise Profile', hindiLabel: 'संस्थागत प्रोफ़ाइल', path: '/buyer/profile', icon: User }
  ];

  const items = role === 'farmer' ? farmerItems : buyerItems;

  return (
    <aside className={`w-64 bg-white border-r border-stone-200/90 shrink-0 hidden lg:flex flex-col py-5 px-3 select-none ${className}`}>
      <div className="px-3 mb-3">
        <span className="text-[11px] font-bold tracking-wider uppercase text-stone-600 block">
          {role === 'farmer' ? (language === 'hi' ? 'किसान पोर्टल' : 'FARMER PORTAL') : (language === 'hi' ? 'खरीदार पोर्टल' : 'BUYER PORTAL')}
        </span>
      </div>

      <nav className="space-y-1 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/farmer' || item.path === '/buyer'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-stone-600 group-hover:text-stone-700'}`} />
                    <span className="truncate">
                      {language === 'hi' && item.hindiLabel ? item.hindiLabel : item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase ${
                      isActive ? 'bg-emerald-900 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Institutional Compliance Box */}
      <div className="mt-auto pt-4 border-t border-stone-100 px-3">
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>e-NAM & APMC Aligned</span>
          </div>
          <p className="text-[10px] text-stone-500 leading-tight">
            Certified transparent assaying, weighbridge receipts & RBI escrow guarantee.
          </p>
        </div>
      </div>
    </aside>
  );
};
