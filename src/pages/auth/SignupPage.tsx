import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SignupForm } from '../../components/auth/SignupForm';
import { BrandLogo } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Award } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useApp();

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-block mb-3">
          <BrandLogo size="lg" />
        </Link>
        <h2 className="text-2xl font-extrabold text-stone-900 font-display">
          {language === 'hi' ? 'नया खाता बनाएं' : 'Create Kisan Saathi Account'}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-stone-600">
          {language === 'hi'
            ? 'किसान, FPO या थोक खरीदार के रूप में पंजीकरण करें'
            : 'Join as a Verified Farmer, FPO Producer, or Institutional Buyer'}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-5 sm:px-10 rounded-3xl shadow-xl border border-stone-200/80">
          <SignupForm
            onSuccess={(res) => {
              const userRole = res?.user?.role;
              if (userRole === 'farmer') {
                navigate('/farmer');
              } else if (userRole === 'buyer') {
                navigate('/buyer');
              } else {
                navigate('/role-selection');
              }
            }}
            onSwitchToLogin={() => navigate('/login')}
            language={language}
          />
        </div>

        <div className="mt-6 text-center text-xs text-stone-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800 underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
