import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, SignupData, LoginCredentials, AuthResponse } from '../types';
import { authService, AuthError } from '../services/authService';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'ks_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleAuthConfig, setGoogleAuthConfig] = useState<{ googleAuthEnabled: boolean; googleClientId: string | null }>({
    googleAuthEnabled: false,
    googleClientId: null
  });

  const clearError = () => setAuthError(null);

  // Initialize session from server on mount
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      // Load Google client config
      try {
        const config = await authService.getAuthConfig();
        if (isMounted) setGoogleAuthConfig(config);
      } catch (err) {
        // Non-fatal
      }

      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        // Strictly validate token on the server
        const serverVerifiedUser = await authService.fetchCurrentUser(storedToken);
        if (isMounted) {
          setUser(serverVerifiedUser);
          setToken(storedToken);
        }
      } catch (err: any) {
        console.warn('Session verification failed:', err.message);
        // Token invalid or expired - clean up
        localStorage.removeItem(TOKEN_KEY);
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login handler
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    clearError();
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (err: any) {
      const msg = err instanceof AuthError ? err.message : 'Login failed. Please try again.';
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup handler
  const signup = async (data: SignupData): Promise<AuthResponse> => {
    clearError();
    setIsLoading(true);
    try {
      const response = await authService.signup(data);
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (err: any) {
      const msg = err instanceof AuthError ? err.message : 'Signup failed. Please try again.';
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    clearError();
  }, []);

  // Profile update
  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    if (!token) throw new Error('Not authenticated');
    clearError();
    try {
      const updatedUser = await authService.updateProfile(token, updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      const msg = err instanceof AuthError ? err.message : 'Failed to update profile.';
      setAuthError(msg);
      throw err;
    }
  };

  // Forgot password
  const forgotPassword = async (identifier: string) => {
    clearError();
    return await authService.forgotPassword(identifier);
  };

  // Reset password
  const resetPassword = async (data: { resetToken: string; newPassword: string; otpCode?: string }) => {
    clearError();
    const result = await authService.resetPassword(data);
    return result.success;
  };

  // Google login
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
      const response = await authService.googleLogin(payload);
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (err: any) {
      const msg = err instanceof AuthError ? err.message : 'Google authentication failed.';
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Quick switch between pre-seeded role accounts for testing (Uses authentic server authentication)
  const switchAccountForRole = async (role: UserRole) => {
    const creds: Record<UserRole, LoginCredentials> = {
      farmer: { identifier: 'rameshwar.patel@kisansaathi.in', password: 'Farmer@123', requestedRole: 'farmer' },
      buyer: { identifier: 'vikram.aggarwal@bharatagroexports.com', password: 'Buyer@123', requestedRole: 'buyer' },
      admin: { identifier: 'admin.compliance@kisansaathi.gov.in', password: 'Admin@123!', requestedRole: 'admin' }
    };

    await login(creds[role]);
  };

  // Update current authenticated user's role — calls server, receives fresh token
  const updateRole = async (role: UserRole): Promise<void> => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) throw new Error('Not authenticated');
    clearError();
    try {
      const { user: updatedUser, token: freshToken } = await authService.updateRole(storedToken, role);
      localStorage.setItem(TOKEN_KEY, freshToken);
      setToken(freshToken);
      setUser(updatedUser);
    } catch (err: any) {
      const msg = err instanceof AuthError ? err.message : 'Failed to update role.';
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
        googleAuthConfig
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
