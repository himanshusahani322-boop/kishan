import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';
import { ForgotPasswordModal } from '../../components/auth/ForgotPasswordModal';
import { BrandLogo, PageContainer } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, TrendingUp, Users, Truck } from 'lucide-react';
import type { AuthResponse } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Use the AuthResponse returned directly from login — avoids stale user closure
  const handleSuccess = (response?: AuthResponse) => {
    const role = response?.user?.role;
    if (role === 'farmer') {
      navigate('/farmer');
    } else if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/buyer');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-block mb-3">
          <BrandLogo size="lg" />
        </Link>
        <h2 className="text-2xl font-extrabold text-stone-900 font-display">
          {language === 'hi' ? 'किसान साथी पोर्टल लॉगिन' : 'Sign in to Kisan Saathi'}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-stone-600">
          {language === 'hi'
            ? 'भारत का प्रमाणित कृषि बाज़ार व थोक प्रोक्योरमेंट एक्सचेंज'
            : "India's Certified Agricultural Marketplace & Institutional Exchange"}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-5 sm:px-10 rounded-3xl shadow-xl border border-stone-200/80">
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToSignup={() => navigate('/signup')}
            onForgotPasswordClick={() => setShowForgotPassword(true)}
            language={language}
          />
        </div>

        {/* Security & Verification trust footnote */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-stone-500 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% RBI Escrow
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            e-NAM Synced
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-600" />
            GPS Dispatch
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            APMC Verified
          </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccessReturnToLogin={() => setShowForgotPassword(false)}
        language={language}
      />
    </div>
  );
};
