import React from 'react';
import { UserRole } from '../../types';
import { Wheat, ShoppingBag, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface RoleSelectionCardsProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  language?: 'en' | 'hi';
  hideAdmin?: boolean;
}

export const RoleSelectionCards: React.FC<RoleSelectionCardsProps> = ({
  selectedRole,
  onSelectRole,
  language = 'en',
  hideAdmin = true
}) => {
  const isHindi = language === 'hi';

  const allRoles = [
    {
      id: 'farmer' as UserRole,
      title: isHindi ? 'किसान / FPO (विक्रेता)' : 'Farmer / FPO (Seller)',
      hindiSubtitle: 'अपनी फसल सीधे थोक भाव पर बेचें',
      description: isHindi
        ? 'मंडी शुल्क से मुक्त, सीधे खरीदारों से जुड़ें और पारदर्शी ई-पेमेंट पाएं।'
        : 'List harvests, negotiate bulk RFQ bids directly with wholesale buyers, and get guaranteed e-Escrow payment.',
      icon: Wheat,
      color: 'emerald',
      badge: isHindi ? 'उत्पादक' : 'Producer',
      highlights: isHindi
        ? ['नि:शुल्क फसल लिस्टिंग', 'APMC बेंचमार्क रेट', '100% बैंक एस्क्रो सुरक्षा']
        : ['Free harvest listing', 'APMC Mandi benchmarks', '100% RBI Escrow payout']
    },
    {
      id: 'buyer' as UserRole,
      title: isHindi ? 'थोक खरीदार / व्यापारी' : 'Wholesale Buyer / Trader',
      hindiSubtitle: 'गुणवत्ता-प्रमाणित उपज का थोक उठाव',
      description: isHindi
        ? 'सत्यापित फार्म्स से थोक खरीद, AGMARK गुणवत्ता रिपोर्ट, और लाइव ट्रक ट्रैकिंग।'
        : 'Procure truckloads directly from verified farmers & FPOs with AGMARK quality inspection and live GPS dispatch.',
      icon: ShoppingBag,
      color: 'amber',
      badge: isHindi ? 'थोक खरीदार' : 'Bulk Buyer',
      highlights: isHindi
        ? ['एगमार्क क्वालिटी चेक', 'डिजिटल धर्मकांटा पर्ची', 'लाइव जीपीएस लॉजिस्टिक्स']
        : ['AGMARK quality assay', 'Weighbridge slips', 'Live GPS logistics']
    },
    {
      id: 'admin' as UserRole,
      title: isHindi ? 'मंडी अनुपालन एडमिन' : 'APMC Compliance Admin',
      hindiSubtitle: 'मंडी नियमन व प्लेटफॉर्म निगरानी',
      description: isHindi
        ? 'ई-नाम एकीकरण, विवाद समाधान, व्यापारी केवाईसी और एस्क्रो ऑडिट संचालन।'
        : 'Apex oversight: dispute mediation, statutory cess reconciliation, KYC verification, and e-NAM synchronization.',
      icon: ShieldCheck,
      color: 'blue',
      badge: isHindi ? 'प्रशासक' : 'Regulatory',
      highlights: isHindi
        ? ['एस्क्रो रिलीज ऑडिट', 'केवाईसी व लाइसेंस सत्यापन', 'विवाद निवारण']
        : ['Escrow release audit', 'KYC & license vetting', 'Dispute mediation']
    }
  ];

  const roles = hideAdmin ? allRoles.filter((r) => r.id !== 'admin') : allRoles;

  return (
    <div className={`grid grid-cols-1 ${roles.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-3`}>
      {roles.map((r) => {
        const Icon = r.icon;
        const isSelected = selectedRole === r.id;

        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelectRole(r.id)}
            className={`relative text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              isSelected
                ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-600/30'
                : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
            }`}
            id={`role-select-card-${r.id}`}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 text-emerald-700">
                <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                    isSelected ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isSelected ? 'bg-emerald-200 text-emerald-900' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {r.badge}
                  </span>
                  <h4 className="font-bold text-sm text-stone-900 leading-tight">{r.title}</h4>
                </div>
              </div>

              <p className="text-xs text-stone-600 mb-3 leading-relaxed">{r.description}</p>
            </div>

            <div className="pt-2 border-t border-stone-200/60 mt-auto space-y-1">
              {r.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-stone-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
};
