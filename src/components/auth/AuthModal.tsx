import React, { useState } from 'react';
import { Modal } from '../ui';
import { BrandLogo } from '../ui/BrandLogo';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
  language?: 'en' | 'hi';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const isHindi = language === 'hi';

  const handleSuccess = () => {
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="lg"
        id="auth-modal"
      >
        <div className="p-6">
          {/* Header */}
          <div className="text-center pb-4 border-b border-stone-200 space-y-2">
            <div className="flex justify-center">
              <BrandLogo size="md" />
            </div>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {isHindi
                ? 'भारत का प्रमुख राष्ट्रीय कृषि बाज़ार • e-NAM एवं APMC अधिकृत'
                : 'National Agricultural Marketplace • e-NAM & APMC Synchronized'}
            </p>

            {/* Auth Switcher Tabs */}
            <div className="flex p-1 bg-stone-100 rounded-xl max-w-xs mx-auto mt-3 border border-stone-200">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                id="modal-tab-login"
              >
                {isHindi ? 'लॉग इन (Sign In)' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                id="modal-tab-signup"
              >
                {isHindi ? 'नया खाता (Register)' : 'New Account'}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="pt-4">
            {activeTab === 'login' ? (
              <LoginForm
                onSuccess={handleSuccess}
                onSwitchToSignup={() => setActiveTab('signup')}
                onForgotPasswordClick={() => setIsForgotPasswordOpen(true)}
                language={language}
              />
            ) : (
              <SignupForm
                onSuccess={handleSuccess}
                onSwitchToLogin={() => setActiveTab('login')}
                language={language}
              />
            )}
          </div>
        </div>
      </Modal>

      {/* Forgot Password Sub-Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onSuccessReturnToLogin={() => {
          setIsForgotPasswordOpen(false);
          setActiveTab('login');
        }}
        language={language}
      />
    </>
  );
};
