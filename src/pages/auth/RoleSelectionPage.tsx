import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { BrandLogo, Button, PageContainer } from '../../components/ui';
import { Sprout, ShoppingBag, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, setRole } = useApp();
  const { updateRole, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectRole = async (role: UserRole) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      setRole(role);
      await updateRole(role);
      if (role === 'farmer') {
        navigate('/farmer');
      } else {
        navigate('/buyer');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update account role. Please try again.');
      setIsSubmitting(false);
    }
  };

  const roles = [
    {
      id: 'farmer' as UserRole,
      title: language === 'hi' ? 'किसान / FPO उत्पादक' : 'Farmer & FPO Producer',
      hindiDesc: 'अपनी फसलें सूचीबद्ध करें, सीधे थोक खरीदारों से बोलियां स्वीकारें, मौसम पूर्वानुमान व APMC मंडी भाव देखें।',
      desc: 'List harvest lots, accept bulk bids from verified institutional buyers, track dispatches, and access Krishi AI.',
      icon: Sprout,
      color: 'border-emerald-500 bg-emerald-50/40 text-emerald-950',
      badge: 'Zero Brokerage',
      features: ['Direct Harvest Listings', 'Assayed Mandi Prices', '100% Guaranteed Escrow Payouts']
    },
    {
      id: 'buyer' as UserRole,
      title: language === 'hi' ? 'थोक व्यापारी व खरीदार' : 'Wholesale & Enterprise Buyer',
      hindiDesc: 'पूरे भारत के सत्यापित किसानों से सीधे गुणवत्ता-परीक्षित फसलें खरीदें, धर्मकांटा पर्ची जांचें व RFQ मांग दर्ज करें।',
      desc: 'Procure assayed agricultural commodities, negotiate RFQs, schedule GPS freight trucks, and manage weighments.',
      icon: ShoppingBag,
      color: 'border-amber-500 bg-amber-50/40 text-amber-950',
      badge: 'APMC License Aligned',
      features: ['Spot Crop Marketplace', 'Custom RFQ Bidding', 'RBI Pre-Funded Escrow Delivery']
    }
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <PageContainer maxWidth="lg">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-3">
          <div className="flex justify-center">
            <BrandLogo size="lg" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
            {language === 'hi' ? 'अपनी भूमिका चुनें' : 'Choose Your Platform Profile'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            {language === 'hi'
              ? 'किसान साथी आपकी आवश्यकताओं के अनुसार विशेष उपकरण और डैशबोर्ड प्रदान करता है।'
              : 'Tailored agricultural workflows, mandi rates, and escrow facilities suited to your exact trade mandate.'}
          </p>
          {user?.name && (
            <p className="text-xs text-emerald-700 font-medium">
              Signed in as <span className="font-bold">{user.name}</span> ({user.email})
            </p>
          )}
        </div>

        {error && (
          <div className="max-w-xl mx-auto mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                onClick={() => handleSelectRole(r.id)}
                className={`group p-6 rounded-3xl border-2 bg-white shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-1 ${r.color} ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}
                id={`role-card-${r.id}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-stone-100 flex items-center justify-center text-stone-900 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-emerald-700" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-stone-200 uppercase tracking-wider">
                      {r.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 font-display">
                    {r.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {language === 'hi' ? r.hindiDesc : r.desc}
                  </p>

                  <div className="mt-4 pt-4 border-t border-stone-200/60 space-y-1.5">
                    {r.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-medium text-stone-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span>{isSubmitting ? 'Saving Role…' : 'Enter Portal'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </PageContainer>
    </div>
  );
};
