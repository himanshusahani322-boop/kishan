import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, SignupData, LoginCredentials, AuthResponse } from '../types';
import { authService, AuthError } from '../services/authService';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { getFirebaseServices, isFirebaseConfigured } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  clearError: () => void;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  signup: (data: SignupData) => Promise<AuthResponse>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  forgotPassword: (identifier: string) => Promise<{
    success: boolean;
    message: string;
    resetToken?: string;
    otpCode?: string;
    contactMasked?: string;
  }>;
  resetPassword: (data: { resetToken: string; newPassword: string; otpCode?: string }) => Promise<boolean>;
  loginWithGoogle: (payload: {
    credential?: string;
    role?: UserRole;
    email?: string;
    name?: string;
    picture?: string;
    demoAccount?: { role: UserRole };
  }) => Promise<AuthResponse>;
  switchAccountForRole: (role: UserRole) => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
  googleAuthConfig: { googleAuthEnabled: boolean; googleClientId: string | null };
  isFirebaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'ks_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleAuthConfig, setGoogleAuthConfig] = useState<{ googleAuthEnabled: boolean; googleClientId: string | null }>({
    googleAuthEnabled: isFirebaseConfigured(),
    googleClientId: null
  });

  const clearError = () => setAuthError(null);

  // Initialize session on mount: Listen to Firebase Auth or restore saved session
  useEffect(() => {
    let isMounted = true;

    let unsubscribeFirebase: (() => void) | undefined;

    if (isFirebaseConfigured()) {
      // Real-time listener for Firebase Authentication state
      const { auth } = getFirebaseServices();
      unsubscribeFirebase = onAuthStateChanged(auth, async (fbUser) => {
        if (!isMounted) return;

        if (fbUser) {
          try {
            const profile = await firebaseAuthService.fetchUserProfile(fbUser.uid);
            const idToken = await fbUser.getIdToken();
            if (profile && isMounted) {
              setUser(profile);
              setToken(idToken);
              localStorage.setItem(TOKEN_KEY, idToken);
            }
          } catch (e) {
            console.warn('[Firebase] Auth state error:', e);
          } finally {
            if (isMounted) setIsLoading(false);
          }
        } else {
          // Check for saved demo account session
          const storedToken = localStorage.getItem(TOKEN_KEY);
          if (storedToken && storedToken.startsWith('ks_demo_jwt_')) {
            if (isMounted) setIsLoading(false);
          } else {
            if (isMounted) {
              setUser(null);
              setToken(null);
              setIsLoading(false);
            }
          }
        }
      });
    } else {
      // Firebase keys pending on Vercel: Check local demo token or server session
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        authService.fetchCurrentUser(storedToken)
          .then((u) => {
            if (isMounted) {
              setUser(u);
              setToken(storedToken);
            }
          })
          .catch(() => {
            if (!storedToken.startsWith('ks_demo_jwt_')) {
              localStorage.removeItem(TOKEN_KEY);
              if (isMounted) {
                setUser(null);
                setToken(null);
              }
            }
          })
          .finally(() => {
            if (isMounted) setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }

    return () => {
      isMounted = false;
      if (unsubscribeFirebase) unsubscribeFirebase();
    };
  }, []);

  // Login handler: Uses Firebase Auth & Firestore with seamless fallback
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    clearError();
    setIsLoading(true);
    try {
      const response = await firebaseAuthService.login(credentials);
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (firebaseErr: any) {
      // A configured Firebase project is authoritative. Falling back here would
      // hide Auth/Firestore errors and create a second, unrelated account.
      if (isFirebaseConfigured()) {
        const msg = firebaseErr.message || 'Firebase login failed. Please try again.';
        console.error('[Firebase Auth] Login failed:', firebaseErr);
        setAuthError(msg);
        throw new Error(msg);
      }

      // Local development without Firebase keeps the pre-existing API fallback.
      try {
        const legacyResponse = await authService.login(credentials);
        localStorage.setItem(TOKEN_KEY, legacyResponse.token);
        setToken(legacyResponse.token);
        setUser(legacyResponse.user);
        return legacyResponse;
      } catch (legacyErr: any) {
        const msg = firebaseErr.message || (legacyErr instanceof AuthError ? legacyErr.message : 'Login failed. Please verify your credentials.');
        setAuthError(msg);
        throw new Error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Signup handler: Uses Firebase Auth & Firestore with seamless fallback
  const signup = async (data: SignupData): Promise<AuthResponse> => {
    clearError();
    setIsLoading(true);
    try {
      const response = await firebaseAuthService.signup(data);
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (firebaseErr: any) {
      // Do not mask a Firebase Auth or Firestore failure by attempting the
      // legacy API when Firebase is configured for this environment.
      if (isFirebaseConfigured()) {
        const msg = firebaseErr.message || 'Firebase signup failed. Please try again.';
        console.error('[Firebase Auth] Signup failed:', firebaseErr);
        setAuthError(msg);
        throw new Error(msg);
      }

      try {
        const legacyResponse = await authService.signup(data);
        localStorage.setItem(TOKEN_KEY, legacyResponse.token);
        setToken(legacyResponse.token);
        setUser(legacyResponse.user);
        return legacyResponse;
      } catch (legacyErr: any) {
        const msg = firebaseErr.message || (legacyErr instanceof AuthError ? legacyErr.message : 'Registration failed.');
        setAuthError(msg);
        throw new Error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler: Signs out from Firebase Auth and clears local tokens
  const logout = useCallback(async () => {
    await firebaseAuthService.logout();
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    clearError();
  }, []);

  // Profile update: Updates Firestore and state
  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    if (!token) throw new Error('Not authenticated');
    clearError();
    try {
      if (isFirebaseConfigured() && user) {
        const updated = await firebaseAuthService.updateProfile(user.id, updates);
        setUser(updated);
        return updated;
      }
      const updatedUser = await authService.updateProfile(token, updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      const msg = err.message || 'Failed to update profile.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Forgot password
  const forgotPassword = async (identifier: string) => {
    clearError();
    if (isFirebaseConfigured() && identifier.includes('@')) {
      try {
        await firebaseAuthService.sendPasswordReset(identifier.trim());
        return {
          success: true,
          message: 'Password reset link sent to your email address via Firebase! Please check your inbox.'
        };
      } catch (err: any) {
        throw new Error(err.message || 'Failed to send password reset email.');
      }
    }
    return await authService.forgotPassword(identifier);
  };

  // Reset password
  const resetPassword = async (data: { resetToken: string; newPassword: string; otpCode?: string }) => {
    clearError();
    const result = await authService.resetPassword(data);
    return result.success;
  };

  // Google login via Firebase popup
  const loginWithGoogle = async (payload: {
    credential?: string;
    role?: UserRole;
    email?: string;
    name?: string;
    picture?: string;
    demoAccount?: { role: UserRole };
  }): Promise<AuthResponse> => {
    clearError();
    setIsLoading(true);
    try {
      if (isFirebaseConfigured()) {
        const response = await firebaseAuthService.loginWithGoogle(payload.role || payload.demoAccount?.role || 'farmer');
        localStorage.setItem(TOKEN_KEY, response.token);
        setToken(response.token);
        setUser(response.user);
        return response;
      }
      const response = await authService.googleLogin(payload);
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (err: any) {
      const msg = err.message || 'Google authentication failed.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Fast switch between pre-seeded role accounts for testing
  const switchAccountForRole = async (role: UserRole) => {
    const creds: Record<UserRole, LoginCredentials> = {
      farmer: { identifier: 'rameshwar.patel@kisansaathi.in', password: 'Farmer@123', requestedRole: 'farmer' },
      buyer: { identifier: 'vikram.aggarwal@bharatagroexports.com', password: 'Buyer@123', requestedRole: 'buyer' },
      admin: { identifier: 'admin.compliance@kisansaathi.gov.in', password: 'Admin@123!', requestedRole: 'admin' }
    };

    await login(creds[role]);
  };

  // Update current authenticated user's role
  const updateRole = async (role: UserRole): Promise<void> => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) throw new Error('Not authenticated');
    clearError();
    try {
      if (user && isFirebaseConfigured()) {
        const updated = await firebaseAuthService.updateProfile(user.id, { role });
        setUser(updated);
        return;
      }
      const { user: updatedUser, token: freshToken } = await authService.updateRole(storedToken, role);
      localStorage.setItem(TOKEN_KEY, freshToken);
      setToken(freshToken);
      setUser(updatedUser);
    } catch (err: any) {
      const msg = err.message || 'Failed to update role.';
      setAuthError(msg);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        authError,
        clearError,
        login,
        signup,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        loginWithGoogle,
        switchAccountForRole,
        updateRole,
        googleAuthConfig,
        isFirebaseActive: isFirebaseConfigured()
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
