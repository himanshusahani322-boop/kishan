import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { authService } from '../../services/authService';
import { Button } from '../ui';
import { 
  ShieldAlert, 
  Lock, 
  UserCheck, 
  ArrowRight, 
  Wheat, 
  ShoppingBag, 
  ShieldCheck, 
  LogIn, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  featureName: string;
  featureDescription?: string;
  children: React.ReactNode;
  onOpenAuth: () => void;
  onNavigateView: (view: string) => void;
  language?: 'en' | 'hi';
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  featureName,
  featureDescription,
  children,
  onOpenAuth,
  onNavigateView,
  language = 'en'
}) => {
  const { user, token, isAuthenticated, isLoading, switchAccountForRole } = useAuth();
  const [serverVerified, setServerVerified] = useState<boolean | null>(null);
  const [isCheckingServer, setIsCheckingServer] = useState<boolean>(false);

  const isHindi = language === 'hi';

  // Server-side authoritative verification to ensure client hasn't manipulated role
  useEffect(() => {
    let active = true;

    async function verifyWithServer() {
      if (!isAuthenticated || !token || !user) {
        setServerVerified(false);
        return;
      }

      setIsCheckingServer(true);
      try {
        const requiredRole = allowedRoles[0];
        const res = await authService.verifyRoleAccess(token, requiredRole);
        if (active) {
          setServerVerified(res.authorized);
        }
      } catch (err) {
        // If server says unauthorized or forbidden
        if (active) {
          setServerVerified(false);
        }
      } finally {
        if (active) {
          setIsCheckingServer(false);
        }
      }
    }

    verifyWithServer();

    return () => {
      active = false;
    };
  }, [isAuthenticated, token, user, allowedRoles]);

  if (isLoading || isCheckingServer) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-stone-600">
          {isHindi ? 'सर्वर से सुरक्षा व भूमिका की पुष्टि हो रही है...' : 'Verifying cryptographic credentials with APMC server...'}
        </p>
      </div>
    );
  }

  // 1. Case: User is NOT authenticated (Guest)
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto my-8 bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden p-6 sm:p-8 text-center space-y-5 animate-in fade-in">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {isHindi ? 'सुरक्षित अनुभाग' : 'Protected Area'}
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 font-display">
            {isHindi ? `${featureName} के लिए लॉगिन आवश्यक है` : `Authentication Required: ${featureName}`}
          </h3>
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            {featureDescription ||
              (isHindi
                ? 'इस सुविधा का उपयोग करने के लिए कृपया अपने किसान साथी खाते में लॉग इन करें या नया नि:शुल्क खाता बनाएं।'
                : 'Access to this agricultural procurement and trade facility requires a verified Kisan Saathi account.')}
          </p>
        </div>

        {/* Roles permitted hint */}
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-center justify-center gap-2">
          <span>{isHindi ? 'स्वीकृत खाता भूमिकाएँ:' : 'Authorized Account Roles:'}</span>
          <div className="flex items-center gap-1.5">
            {allowedRoles.map((r) => (
              <span
                key={r}
                className="font-extrabold text-[10px] uppercase bg-white px-2 py-0.5 rounded border border-stone-300 text-stone-800"
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={onOpenAuth}
            leftIcon={<LogIn className="w-4 h-4" />}
            id="role-guard-login-btn"
          >
            {isHindi ? 'लॉग इन / नया खाता' : 'Sign In / Create Account'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => onNavigateView('marketplace')}
            id="role-guard-back-market-btn"
          >
            {isHindi ? 'मंडी बाज़ार देखें' : 'Browse Public Marketplace'}
          </Button>
        </div>
      </div>
    );
  }

  // 2. Case: User is authenticated, but their server-verified role is NOT in allowedRoles
  const isRoleAllowed = allowedRoles.includes(user.role) || user.role === 'admin';

  if (!isRoleAllowed || serverVerified === false) {
    const requiredRoleDisplay = allowedRoles.map((r) => r.toUpperCase()).join(' or ');
    const targetSwitchRole = allowedRoles[0];

    return (
      <div className="max-w-xl mx-auto my-8 bg-white rounded-2xl shadow-xl border-2 border-amber-300 overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in">
        {/* Warning Icon & Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                403 Role Restriction
              </span>
              <span className="text-xs text-stone-400">Server-Authoritative</span>
            </div>
            <h3 className="text-lg font-extrabold text-stone-900 font-display mt-1">
              {isHindi ? 'भूमिका प्रतिबंध: पहुँच अस्वीकृत' : `Access Restricted: ${requiredRoleDisplay} Only`}
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              {isHindi
                ? `यह भाग (${featureName}) केवल ${requiredRoleDisplay} खातों के लिए आरक्षित है।`
                : `The section "${featureName}" is restricted to ${requiredRoleDisplay} accounts.`}
            </p>
          </div>
        </div>

        {/* Current User Role Notice */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Your Current Active Account:</span>
            <span className="font-bold text-stone-900">{user.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Server-Verified Role:</span>
            <span className="font-extrabold uppercase px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded text-[10px]">
              {user.role}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 pt-1 border-t border-stone-200 leading-relaxed">
            {user.role === 'farmer'
              ? 'Farmers cannot access Wholesale Buyer order management, cart purchasing, or buyer-only RFQs.'
              : user.role === 'buyer'
              ? 'Wholesale Buyers cannot access Farmer farm harvest listings, incoming crop bids, or farmer-only payout ledgers.'
              : 'Non-admin users cannot access Apex Platform Administration.'}
          </p>
        </div>

        {/* Remediation Options */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="primary"
              onClick={async () => {
                await switchAccountForRole(targetSwitchRole);
              }}
              leftIcon={<RotateCcw className="w-4 h-4" />}
              id="switch-account-role-btn"
            >
              {isHindi
                ? `परीक्षण हेतु ${targetSwitchRole.toUpperCase()} खाते पर स्विच करें`
                : `Switch to Test ${targetSwitchRole.toUpperCase()} Account`}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (user.role === 'farmer') {
                  onNavigateView('farmer_dashboard');
                } else if (user.role === 'buyer') {
                  onNavigateView('orders');
                } else {
                  onNavigateView('admin');
                }
              }}
              id="return-eligible-dashboard-btn"
            >
              {isHindi ? 'मेरी स्वीकृत डैशबोर्ड पर जाएं' : `Go to My ${user.role.toUpperCase()} Dashboard`}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => onNavigateView('marketplace')}
            className="w-full text-center py-2 text-xs font-bold text-stone-500 hover:text-stone-800 cursor-pointer"
            id="back-marketplace-btn"
          >
            ← {isHindi ? 'मंडी बाज़ार पर लौटें' : 'Back to Public Mandi Marketplace'}
          </button>
        </div>
      </div>
    );
  }

  // 3. User is authenticated and role is authorized
  return <>{children}</>;
};
