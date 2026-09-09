import { User, UserRole, SignupData, LoginCredentials, AuthResponse } from '../types';

const API_BASE = '/api/auth';

export class AuthError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export const authService = {
  // Signup new user
  async signup(data: SignupData): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!res.ok) {
      throw new AuthError(result.error || 'Failed to complete registration.', res.status);
    }
    return result;
  },

  // Login existing user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const result = await res.json();
    if (!res.ok) {
      throw new AuthError(result.error || 'Invalid credentials.', res.status);
    }
    return result;
  },

  // Fetch current user using bearer token (Server authoritative)
  async fetchCurrentUser(token: string): Promise<User> {
    const res = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await res.json();
    if (!res.ok) {
      throw new AuthError(result.error || 'Session expired. Please sign in again.', res.status);
    }
    return result.user;
  },

  // Update profile
  async updateProfile(token: string, updates: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    const result = await res.json();
    if (!res.ok) {
      throw new AuthError(result.error || 'Failed to update profile.', res.status);
    }
    return result.user;
  },

  // Request password reset
  async forgotPassword(identifier: string): Promise<{
    success: boolean;
    message: string;
    resetToken?: string;
    otpCode?: string;
    contactMasked?: string;
  }> {
    const res = await fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier })
    });

    const result = await res.json();
    if (!res.ok) {
      throw new AuthError(result.error || 'Failed to request password reset.', res.status);
    }
    return result;
  },

  // Reset password with token & OTP
  async resetPassword(data: {
    resetToken: string;
    newPassword: string;
    otpCode?: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!res.ok) {
      throw new AuthError(result.error || 'Failed to reset password.', res.status);
    }
    return result;
  },

  // Google Sign-In or Demo Google login
  async googleLogin(payload: {
    credential?: string;
    role?: UserRole;
    email?: string;
    name?: string;
    picture?: string;
    demoAccount?: { role: UserRole };
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!res.ok) {
      throw new AuthError(result.error || 'Google sign-in failed.', res.status);
    }
    return result;
  },

  // Check auth configuration
  async getAuthConfig(): Promise<{ googleAuthEnabled: boolean; googleClientId: string | null }> {
    try {
      const res = await fetch(`${API_BASE}/config`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return { googleAuthEnabled: false, googleClientId: null };
  },

  // Server-side role verification
  async verifyRoleAccess(token: string, requiredRole: UserRole): Promise<{ authorized: boolean; userRole: string }> {
    const res = await fetch(`${API_BASE}/check-access/${requiredRole}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await res.json();
    return {
      authorized: res.ok && result.authorized,
      userRole: result.userRole
    };
  },

  // Update authenticated user's role (farmer/buyer only)
  async updateRole(token: string, role: UserRole): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/update-role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    });

    const result = await res.json();
    if (!res.ok) {
      throw new AuthError(result.error || 'Failed to update role.', res.status);
    }
    return { user: result.user, token: result.token };
  }
};

