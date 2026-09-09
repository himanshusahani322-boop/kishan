import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Button, Input } from '../ui';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Wheat, 
  ShoppingBag, 
  ShieldCheck, 
  CheckCircle2, 
  Info 
} from 'lucide-react';

interface LoginFormProps {
  onSuccess?: (response?: any) => void;
  onSwitchToSignup?: () => void;
  onForgotPasswordClick?: () => void;
  language?: 'en' | 'hi';
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToSignup,
  onForgotPasswordClick,
  language = 'en'
}) => {
  const { login, loginWithGoogle, authError, clearError, isLoading, googleAuthConfig } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoleTab, setSelectedRoleTab] = useState<UserRole>('farmer');
  const [localError, setLocalError] = useState<string | null>(null);

  const isHindi = language === 'hi';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!identifier.trim()) {
      setLocalError(isHindi ? 'कृपया ईमेल या मोबाइल नंबर दर्ज करें' : 'Please enter your email or mobile number.');
      return;
    }

    if (!password) {
      setLocalError(isHindi ? 'कृपया पासवर्ड दर्ज करें' : 'Please enter your password.');
      return;
    }

    try {
      const res = await login({
        identifier: identifier.trim(),
        password,
        requestedRole: selectedRoleTab
      });
      if (onSuccess) onSuccess(res);
    } catch (err: any) {
      // Error handled in AuthContext, also caught here
    }
  };

  // 1-Click Fast Test demo logins with authentic pre-seeded credentials
  const handleQuickTestLogin = async (role: UserRole) => {
    setLocalError(null);
    clearError();
    const demoAccounts: Record<UserRole, { identifier: string; password: string }> = {
      farmer: { identifier: 'rameshwar.patel@kisansaathi.in', password: 'Farmer@123' },
      buyer: { identifier: 'vikram.aggarwal@bharatagroexports.com', password: 'Buyer@123' },
      admin: { identifier: 'admin.compliance@kisansaathi.gov.in', password: 'Admin@123!' }
    };

    const target = demoAccounts[role];
    setIdentifier(target.identifier);
    setPassword(target.password);
    setSelectedRoleTab(role);

    try {
      const res = await login({
        identifier: target.identifier,
        password: target.password,
        requestedRole: role
      });
      if (onSuccess) onSuccess(res);
    } catch (err) {
      // Handled
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLocalError(null);
      const res = await loginWithGoogle({
        demoAccount: { role: selectedRoleTab }
      });
      if (onSuccess) onSuccess(res);
    } catch (err: any) {
      setLocalError(err.message || 'Google authentication failed.');
    }
  };

  const displayError = localError || authError;

  return (
    <div className="space-y-5">
      {/* Role Selection Tabs for Context */}
      <div>
        <label className="block text-xs font-bold text-stone-700 mb-2">
          {isHindi ? 'भूमिका चुनें (Account Type):' : 'Select Account Type:'}
        </label>
        <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => setSelectedRoleTab('farmer')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedRoleTab === 'farmer'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
            id="login-role-tab-farmer"
          >
            <Wheat className="w-3.5 h-3.5" />
            <span>{isHindi ? 'किसान' : 'Farmer'}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRoleTab('buyer')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedRoleTab === 'buyer'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
            id="login-role-tab-buyer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isHindi ? 'खरीदार' : 'Buyer'}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRoleTab('admin')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedRoleTab === 'admin'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
            id="login-role-tab-admin"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isHindi ? 'एडमिन' : 'Admin'}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {displayError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{displayError}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" id="kisan-login-form">
        <Input
          label={isHindi ? 'ईमेल या 10-अंकों का मोबाइल नंबर' : 'Email or 10-Digit Mobile Number'}
          placeholder={selectedRoleTab === 'farmer' ? 'rameshwar.patel@kisansaathi.in / 9826044123' : 'name@example.com / 9811255981'}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
          autoComplete="username"
          id="login-identifier-input"
        />

        <div className="space-y-1">
          <div className="relative">
            <Input
              label={isHindi ? 'पासवर्ड (Password)' : 'Password'}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
              autoComplete="current-password"
              id="login-password-input"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </div>

          <div className="flex justify-end pt-1">
            {onForgotPasswordClick && (
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
                id="forgot-password-link"
              >
                {isHindi ? 'पासवर्ड भूल गए? (Forgot Password)' : 'Forgot Password?'}
              </button>
            )}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
          id="login-submit-btn"
        >
          {isHindi ? 'सुरक्षित लॉग इन करें' : 'Sign In Securely'}
        </Button>
      </form>

      {/* Google Sign In Integration */}
      <div className="pt-2">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-stone-200" />
          <span className="shrink mx-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            {isHindi ? 'या इसके साथ जुड़ें' : 'Or continue with'}
          </span>
          <div className="flex-grow border-t border-stone-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-700 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          id="google-signin-btn"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{isHindi ? 'Google से साइन इन करें' : 'Sign in with Google'}</span>
          {!googleAuthConfig.googleAuthEnabled && (
            <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-normal">
              Demo/Sandbox
            </span>
          )}
        </button>

        {!googleAuthConfig.googleAuthEnabled && (
          <div className="mt-2 flex items-start gap-1.5 p-2 bg-stone-50 rounded-lg border border-stone-200 text-[10px] text-stone-500 leading-tight">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
            <span>
              <strong>Note for Live Google OAuth:</strong> To enable official Google OAuth verification in production, configure <code className="bg-stone-200 px-1 rounded">GOOGLE_CLIENT_ID</code> in AI Studio Settings. Currently providing secure instant access.
            </span>
          </div>
        )}
      </div>

      {/* 1-Click Test Credentials Panel */}
      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isHindi ? 'त्वरित परीक्षण खाते (1-Click Test Accounts):' : 'Instant 1-Click Test Accounts:'}</span>
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">Pre-Hashed Auth</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => handleQuickTestLogin('farmer')}
            className="p-2 bg-white hover:bg-emerald-100/60 border border-emerald-300 rounded-lg text-left transition-colors cursor-pointer"
            title="Login as Rameshwar Patel (Farmer)"
          >
            <div className="font-bold text-emerald-900 flex items-center gap-1">
              <span>🌾</span> Farmer
            </div>
            <div className="text-[10px] text-stone-500 truncate">Rameshwar Patel</div>
            <div className="text-[9px] text-emerald-700 font-mono">Farmer@123</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickTestLogin('buyer')}
            className="p-2 bg-white hover:bg-emerald-100/60 border border-emerald-300 rounded-lg text-left transition-colors cursor-pointer"
            title="Login as Vikramaditya (Buyer)"
          >
            <div className="font-bold text-amber-900 flex items-center gap-1">
              <span>🛒</span> Buyer
            </div>
            <div className="text-[10px] text-stone-500 truncate">Vikramaditya Agg.</div>
            <div className="text-[9px] text-amber-700 font-mono">Buyer@123</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickTestLogin('admin')}
            className="p-2 bg-white hover:bg-emerald-100/60 border border-emerald-300 rounded-lg text-left transition-colors cursor-pointer"
            title="Login as Pooja Verma (Admin)"
          >
            <div className="font-bold text-blue-900 flex items-center gap-1">
              <span>🛡️</span> Admin
            </div>
            <div className="text-[10px] text-stone-500 truncate">Pooja Verma</div>
            <div className="text-[9px] text-blue-700 font-mono">Admin@123!</div>
          </button>
        </div>
      </div>

      {/* Switch to Signup */}
      {onSwitchToSignup && (
        <div className="text-center text-xs text-stone-600 pt-1">
          <span>{isHindi ? 'क्या आप किसान साथी पर नए हैं?' : "Don't have a Kisan Saathi account yet?"} </span>
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
            id="switch-to-signup-btn"
          >
            {isHindi ? 'नया खाता बनाएं (Register Free)' : 'Create Free Account'}
          </button>
        </div>
      )}
    </div>
  );
};
