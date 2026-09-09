import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Scale, 
  CheckCircle2, 
  Sparkles, 
  Warehouse, 
  Lock, 
  TrendingUp 
} from 'lucide-react';

export type TrustBadgeType = 
  | 'agmark' 
  | 'fpo' 
  | 'escrow' 
  | 'enam' 
  | 'weighbridge' 
  | 'wdra' 
  | 'organic';

export interface TrustBadgeProps {
  type: TrustBadgeType;
  variant?: 'pill' | 'card';
  customText?: string;
  className?: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  type,
  variant = 'pill',
  customText,
  className = ''
}) => {
  const configs: Record<TrustBadgeType, {
    icon: React.ReactNode;
    title: string;
    description: string;
    pillBg: string;
    cardBg: string;
  }> = {
    agmark: {
      icon: <Award className="w-3.5 h-3.5 text-emerald-700" />,
      title: 'AGMARK Quality Assured',
      description: 'Lab assayed for moisture, foreign matter & purity grading standards.',
      pillBg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      cardBg: 'bg-emerald-50/70 border-emerald-200'
    },
    fpo: {
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />,
      title: 'Verified FPO Producer Org',
      description: 'Ministry of Corporate Affairs CIN & Farmer shareholder vetted.',
      pillBg: 'bg-teal-50 text-teal-900 border-teal-300',
      cardBg: 'bg-teal-50/70 border-teal-200'
    },
    escrow: {
      icon: <Lock className="w-3.5 h-3.5 text-indigo-700" />,
      title: '100% RBI Escrow Protected',
      description: 'Funds held securely until physical gate weighment and inspection approval.',
      pillBg: 'bg-indigo-50 text-indigo-900 border-indigo-300',
      cardBg: 'bg-indigo-50/70 border-indigo-200'
    },
    enam: {
      icon: <TrendingUp className="w-3.5 h-3.5 text-amber-700" />,
      title: 'e-NAM Mandi Synchronized',
      description: 'Real-time APMC mandi modal price feeds & electronic bid contracts.',
      pillBg: 'bg-amber-50 text-amber-900 border-amber-300',
      cardBg: 'bg-amber-50/70 border-amber-200'
    },
    weighbridge: {
      icon: <Scale className="w-3.5 h-3.5 text-stone-700" />,
      title: 'Certified Weighbridge Slip',
      description: 'Tamper-proof digital weight receipt at APMC mandi gate.',
      pillBg: 'bg-stone-100 text-stone-800 border-stone-300',
      cardBg: 'bg-stone-100/70 border-stone-200'
    },
    wdra: {
      icon: <Warehouse className="w-3.5 h-3.5 text-blue-700" />,
      title: 'WDRA Warehouse Receipt',
      description: 'Govt. accredited multi-chamber cold storage with negotiable e-NWR.',
      pillBg: 'bg-blue-50 text-blue-900 border-blue-300',
      cardBg: 'bg-blue-50/70 border-blue-200'
    },
    organic: {
      icon: <Sparkles className="w-3.5 h-3.5 text-emerald-600" />,
      title: '100% Certified Organic',
      description: 'NPOP / Jaivik Bharat certified chemical-free harvest lot.',
      pillBg: 'bg-emerald-600 text-white border-emerald-700',
      cardBg: 'bg-emerald-50 border-emerald-300'
    }
  };

  const item = configs[type];

  if (variant === 'card') {
    return (
      <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${item.cardBg} ${className}`}>
        <div className="p-1.5 bg-white rounded-lg shadow-2xs shrink-0 mt-0.5">
          {item.icon}
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-stone-900">{customText || item.title}</h4>
          <p className="text-[11px] text-stone-600 leading-snug">{item.description}</p>
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${item.pillBg} ${className}`}>
      {item.icon}
      <span>{customText || item.title}</span>
    </span>
  );
};
