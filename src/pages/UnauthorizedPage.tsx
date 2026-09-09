import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo, Button } from '../components/ui';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const dashboardPath =
    user?.role === 'farmer' ? '/farmer'
    : user?.role === 'admin' ? '/admin'
    : '/buyer';

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-sm w-full space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <BrandLogo size="md" />
        </div>

        {/* Icon */}
        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-rose-600" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-stone-900 font-display">
            Access Restricted
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            You don't have permission to view this page.
            {user && (
              <span className="block mt-1 text-xs text-stone-500">
                Your current role is{' '}
                <span className="font-bold text-emerald-700 uppercase">{user.role}</span>
                . This area requires a different role.
              </span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate(dashboardPath)}
          >
            <Home className="w-4 h-4 mr-2" />
            Go to My Dashboard
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          {!user && (
            <Button
              variant="ghost"
              fullWidth
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Info box */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 leading-relaxed text-left">
          <p className="font-semibold mb-1">Why am I seeing this?</p>
          <ul className="space-y-1 list-disc list-inside text-amber-700">
            <li>Farmer routes are only accessible to Farmer accounts</li>
            <li>Buyer routes are only accessible to Buyer accounts</li>
            <li>Admin routes require an Admin role assigned by the platform</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
