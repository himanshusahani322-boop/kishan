import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { BrandLogo } from '../ui/BrandLogo';
import { TrustBadge } from '../ui/TrustBadge';
import { 
  ShieldCheck, 
  Wheat, 
  Truck, 
  Lock, 
  Sparkles, 
  Scale, 
  CheckCircle2 
} from 'lucide-react';

interface AuthViewProps {
  initialTab?: 'login' | 'signup';
  language?: 'en' | 'hi';
  onAuthSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialTab = 'login',
  language = 'en',
  onAuthSuccess
}) => {
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const isHindi = language === 'hi';

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8">
      {/* If already authenticated, show status banner */}
      {isAuthenticated && user && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-xl object-cover border border-emerald-600 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 text-sm">Currently signed in as {user.name}</span>
                <span className="bg-emerald-200 text-emerald-900 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Email: {user.email} • Phone: {user.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logout}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Sign Out of Account
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Institutional Trust & Info Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-950 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-700/80 border border-emerald-500/40 text-amber-300 font-black text-lg flex items-center justify-center font-display shadow-sm">
                KS
              </div>
              <div>
                <span className="font-extrabold text-white text-lg tracking-tight block font-display">
                  किसान साथी
                </span>
                <span className="text-emerald-400 text-[11px] font-medium tracking-wide block -mt-1">
                  National Agricultural Marketplace
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-white leading-tight">
                {isHindi ? 'सीधा खेत से मंडी, बिना बिचौलियों के' : 'Direct from Farm to Mandi, Zero Intermediaries'}
              </h2>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                {isHindi
                  ? 'भारत सरकार के e-NAM और APMC मानकों के तहत सत्यापित, 100% सुरक्षित भुगतान और डिजिटल लॉजिस्टिक्स ट्रैकिंग।'
                  : 'Empowering 50,000+ Indian farmers, FPOs, and bulk buyers with real-time APMC Mandi rates, RBI-grade e-Escrow, and verified weighbridge receipts.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-stone-200">
                <div className="w-6 h-6 rounded-lg bg-emerald-800/80 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Wheat className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">
                    {isHindi ? 'किसान व FPO के लिए:' : 'For Farmers & FPOs:'}
                  </strong>
                  <span className="text-[11px] text-emerald-200/80">
                    {isHindi ? 'अपनी उपज का मनचाहा दाम पाएं, तुरंत डिजिटल अग्रिम भुगतान।' : 'Sell harvest directly at APMC benchmark rates with guaranteed escrow release.'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-stone-200">
                <div className="w-6 h-6 rounded-lg bg-emerald-800/80 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">
                    {isHindi ? 'थोक खरीदार व निर्यातकों के लिए:' : 'For Wholesale Buyers:'}
                  </strong>
                  <span className="text-[11px] text-emerald-200/80">
                    {isHindi ? 'AGMARK ग्रेडिंग, प्रमाणित धर्मकांटा पर्ची और जीपीएस ट्रैकिंग।' : 'Direct farm procurement with AGMARK quality inspection & dispatch tracking.'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-stone-200">
                <div className="w-6 h-6 rounded-lg bg-emerald-800/80 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">
                    {isHindi ? '100% सुरक्षित e-Escrow:' : '100% RBI e-Escrow Protected:'}
                  </strong>
                  <span className="text-[11px] text-emerald-200/80">
                    {isHindi ? 'माल तौलने और निरीक्षण के बाद ही भुगतान रिलीज।' : 'Funds locked until digital weighment inspection and buyer quality sign-off.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-emerald-800/50 mt-8 flex items-center justify-between text-[11px] text-emerald-300">
            <span>e-NAM & APMC Sync</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              ISO 27001 Certified
            </span>
          </div>

          {/* Decorative background blur circle */}
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Right Side: Auth Forms */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-white">
          {/* Tab Selection */}
          <div className="flex p-1 bg-stone-100 rounded-xl mb-6 max-w-sm mx-auto w-full border border-stone-200">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              id="auth-view-tab-login"
            >
              {isHindi ? 'लॉग इन (Sign In)' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setTab('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === 'signup'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              id="auth-view-tab-signup"
            >
              {isHindi ? 'नया खाता बनाएं (Register)' : 'New Account'}
            </button>
          </div>

          {tab === 'login' ? (
            <LoginForm
              onSuccess={onAuthSuccess}
              onSwitchToSignup={() => setTab('signup')}
              onForgotPasswordClick={() => setIsForgotPasswordOpen(true)}
              language={language}
            />
          ) : (
            <SignupForm
              onSuccess={onAuthSuccess}
              onSwitchToLogin={() => setTab('login')}
              language={language}
            />
          )}
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onSuccessReturnToLogin={() => {
          setIsForgotPasswordOpen(false);
          setTab('login');
        }}
        language={language}
      />
    </div>
  );
};
