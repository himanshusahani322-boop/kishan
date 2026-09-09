import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  PageContainer, 
  Breadcrumbs, 
  SectionHeader, 
  FormSection, 
  Button, 
  Alert 
} from '../../components/ui';
import { 
  Building, 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  FileCheck, 
  Award, 
  Truck, 
  User, 
  Phone, 
  Mail 
} from 'lucide-react';

export const BuyerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { orders, language } = useApp();

  const totalExpenditure = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalVolume = orders.reduce((sum, o) => sum + o.quantityQuintals, 0);

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Buyer Home', href: '/buyer' },
          { label: 'Enterprise Profile' }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Enterprise Procurement Profile"
        subtitle="Institutional KYC, GST accreditation, APMC trading license, and escrow credit line"
        badge="Verified Corporate Trader"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Company Card */}
          <div className="p-6 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-6">
            <div className="flex items-center gap-4 border-b border-stone-100 pb-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white font-black text-2xl flex items-center justify-center font-display shrink-0 shadow-md">
                BA
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-stone-900 font-display">
                    Bharat Agro Exports & Processing Ltd.
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Tier-1 Institutional Buyer
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Primary Mandate: Food Processing, Roller Flour Milling & Export Aggregation
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Authorized Representative</span>
                <p className="font-bold text-stone-900">{user?.name || 'Vikramaditya Aggarwal'}</p>
                <p className="text-stone-500">{user?.phone || '+91 98112 55981'}</p>
                <p className="text-stone-500">{user?.email || 'vikram.aggarwal@bharatagroexports.com'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Tax & Regulatory Credentials</span>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">GSTIN:</span>
                  <span className="font-mono font-bold text-stone-900">07AAACB2194Q1Z8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">APMC License:</span>
                  <span className="font-mono font-bold text-stone-900">DL-AZP-COMM-2024-441</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">FSSAI Central:</span>
                  <span className="font-mono font-bold text-stone-900">10019011006542</span>
                </div>
              </div>
            </div>
          </div>

          {/* Registered Warehouses / Mandi Hubs */}
          <div className="p-6 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-display border-b border-stone-100 pb-3">
              Registered Intake Warehouses & Sheds
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">Azadpur Agro Logistics Hub (Primary Shed 14)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Default Dock</span>
                  </div>
                  <p className="text-stone-500">Gate 2, Azadpur Mandi Complex, GT Karnal Road, North West Delhi - 110033</p>
                  <p className="text-stone-500">Facility: 50,000 MT Silo + 16-Wheeler Hydraulic Unloading Ramp</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-stone-900">Kandla Port Export Container Depot (Shed B-8)</span>
                  <p className="text-stone-500">Gandhidham, Kutch, Gujarat - 370201</p>
                  <p className="text-stone-500">Facility: Export Assaying & Fumigation Terminal</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Escrow & Procurement Metrics */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 to-stone-900 text-white shadow-md border border-emerald-800 space-y-4">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>RBI Scheduled Escrow Vault</span>
            </div>

            <div>
              <span className="text-xs text-stone-300 block">Active Escrow Credit Line</span>
              <span className="text-3xl font-extrabold text-white font-display">₹50,00,000</span>
              <span className="text-[11px] text-emerald-300 block mt-1">Guaranteed Bank Custody</span>
            </div>

            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-stone-400 text-[10px] block">Settled Volume</span>
                <span className="font-bold">{totalVolume} Q</span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] block">Total Settled</span>
                <span className="font-bold">₹{totalExpenditure.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <Alert variant="escrow" title="Mandi Cess Compliance Certified">
            All procurement settlements through Kisan Saathi automatically generate state market committee Form 6 cess audit receipts.
          </Alert>
        </div>
      </div>
    </PageContainer>
  );
};
