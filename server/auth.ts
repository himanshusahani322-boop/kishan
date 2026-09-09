import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { db } from './db/database';

export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface UserLocation {
  villageOrCity: string;
  district: string;
  state: string;
  pincode: string;
}

export interface StoredUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  avatar: string;
  location: UserLocation;
  isVerifiedFPO?: boolean;
  fpoName?: string;
  businessName?: string;
  businessType?: string;
  gstNumber?: string;
  rating: number;
  totalRatingsCount: number;
  joinedDate: string;
  createdAt: string;
}

export type SafeUser = Omit<StoredUser, 'passwordHash' | 'salt'>;

interface PasswordResetEntry {
  userId: string;
  otpCode: string;
  resetToken: string;
  expiresAt: number;
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'kisan-saathi-production-auth-secret-key-2026';
const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
try {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
} catch (err) {
  console.warn('Could not create data dir:', err);
}

// Password hashing with scrypt
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const key = crypto.scryptSync(password, salt, 64);
    const storedKey = Buffer.from(hash, 'hex');
    if (key.length !== storedKey.length) {
      return false;
    }
    return crypto.timingSafeEqual(key, storedKey);
  } catch (e) {
    return false;
  }
}

// Cryptographic session token generation & verification (HMAC-SHA256)
export function createSessionToken(user: StoredUser): string {
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600; // 7 days
  const payload = {
    userId: user.id,
    role: user.role,
    email: user.email,
    exp,
    iat: Math.floor(Date.now() / 1000)
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadStr)
    .digest('base64url');
  return `${payloadStr}.${signature}`;
}

export function verifySessionToken(token: string): { userId: string; role: UserRole; email: string } | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadStr, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadStr)
      .digest('base64url');

    // Constant-time signature comparison
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return {
      userId: payload.userId,
      role: payload.role as UserRole,
      email: payload.email
    };
  } catch (err) {
    return null;
  }
}

// In-memory + persistent store
let users: StoredUser[] = [];
const resetTokens: Map<string, PasswordResetEntry> = new Map();

function sanitizeUser(user: StoredUser): SafeUser {
  const { passwordHash, salt, ...safe } = user;
  return safe;
}

function saveUsersToFile() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal if container disk is read-only
  }
}

function initSeedUsers() {
  // Try loading from file
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const loaded = JSON.parse(data);
      if (Array.isArray(loaded) && loaded.length > 0) {
        users = loaded;
        return;
      }
    } catch (e) {
      console.warn('Failed to parse users.json, falling back to seed users');
    }
  }

  // Pre-seed trusted institutional accounts
  const farmerPw = hashPassword('Farmer@123');
  const buyerPw = hashPassword('Buyer@123');
  const adminPw = hashPassword('Admin@123!');

  users = [
    {
      id: 'user_farmer_1',
      name: 'Rameshwar Patel',
      phone: '+91 98260 44123',
      email: 'rameshwar.patel@kisansaathi.in',
      passwordHash: farmerPw.hash,
      salt: farmerPw.salt,
      role: 'farmer',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      location: {
        villageOrCity: 'Narsinghpur',
        district: 'Sehore',
        state: 'Madhya Pradesh',
        pincode: '466001'
      },
      isVerifiedFPO: true,
      fpoName: 'Narmada Kisan Samriddhi FPO',
      rating: 4.85,
      totalRatingsCount: 142,
      joinedDate: 'March 2023',
      createdAt: new Date('2023-03-15').toISOString()
    },
    {
      id: 'user_buyer_1',
      name: 'Vikramaditya Aggarwal',
      phone: '+91 98112 55981',
      email: 'vikram.aggarwal@bharatagroexports.com',
      passwordHash: buyerPw.hash,
      salt: buyerPw.salt,
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      location: {
        villageOrCity: 'Azadpur Mandi Complex',
        district: 'North West Delhi',
        state: 'Delhi',
        pincode: '110033'
      },
      businessName: 'Bharat Agro Exports Ltd.',
      businessType: 'Agri Commodity Wholesale Exporter',
      gstNumber: '07AAACB2194Q1Z8',
      rating: 4.9,
      totalRatingsCount: 318,
      joinedDate: 'January 2022',
      createdAt: new Date('2022-01-10').toISOString()
    },
    {
      id: 'user_admin_1',
      name: 'Pooja Verma (Compliance Lead)',
      phone: '+91 94140 88219',
      email: 'admin.compliance@kisansaathi.gov.in',
      passwordHash: adminPw.hash,
      salt: adminPw.salt,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      location: {
        villageOrCity: 'Krishi Bhawan',
        district: 'New Delhi',
        state: 'Delhi',
        pincode: '110001'
      },
      rating: 5.0,
      totalRatingsCount: 500,
      joinedDate: 'November 2021',
      createdAt: new Date('2021-11-01').toISOString()
    },
    {
      id: 'usr-admin-001',
      name: 'Dr. Surendra Mohan Sharma (Nodal Officer)',
      phone: '+91 94250 99881',
      email: 'nodal.officer@apmcsehor.gov.in',
      passwordHash: farmerPw.hash, // Hashes Farmer@123 / Admin@123
      salt: farmerPw.salt,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      location: {
        villageOrCity: 'APMC Mandi Road',
        district: 'Sehore',
        state: 'Madhya Pradesh',
        pincode: '466001'
      },
      rating: 5.0,
      totalRatingsCount: 120,
      joinedDate: 'May 2020',
      createdAt: new Date('2020-05-10').toISOString()
    },
    {
      id: 'usr-buyer-002',
      name: 'Priya Sundaram',
      phone: '+91 98401 23456',
      email: 'priya.sundaram@dakshinrollerflour.com',
      passwordHash: buyerPw.hash, // Hashes Buyer@123
      salt: buyerPw.salt,
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      location: {
        villageOrCity: 'Sriperumbudur',
        district: 'Kanchipuram',
        state: 'Tamil Nadu',
        pincode: '602105'
      },
      businessName: 'Dakshin Roller Flour Mills Pvt Ltd',
      businessType: 'Flour Miller & Food Processor',
      gstNumber: '33AABCD9876Q1Z3',
      rating: 4.88,
      totalRatingsCount: 84,
      joinedDate: 'August 2023',
      createdAt: new Date('2023-08-15').toISOString()
    }
  ];

  saveUsersToFile();
}

initSeedUsers();

// Normalize mobile number to 10 digits for comparison
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

// Authentication Middleware
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No session token provided.' });
  }

  const decoded = verifySessionToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  const user = users.find((u) => u.id === decoded.userId);
  if (!user) {
    return res.status(401).json({ error: 'User account no longer exists.' });
  }

  // Attach verified user and authoritative server-verified role to request
  (req as any).user = user;
  (req as any).role = user.role;
  next();
}

// Role Authorization Guard Middleware (Strictly validates server-verified role)
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).role as UserRole;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: `Access denied. This action requires one of the following roles: [${allowedRoles.join(', ')}]. Current server-verified role: ${userRole || 'none'}.`
      });
    }
    next();
  };
}

// Controller Handlers
export const authController = {
  // Check auth configuration status
  getConfig: (req: Request, res: Response) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    res.json({
      googleAuthEnabled: Boolean(googleClientId && googleClientId.length > 5),
      googleClientId: googleClientId || null,
      environment: process.env.NODE_ENV || 'development'
    });
  },

  // Signup
  signup: (req: Request, res: Response) => {
    try {
      const {
        fullName,
        phone,
        email,
        password,
        confirmPassword,
        role,
        location,
        isVerifiedFPO,
        fpoName,
        businessName,
        businessType
      } = req.body;

      // Validation
      if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
        return res.status(400).json({ error: 'Full name must be at least 2 characters.' });
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }

      const cleanPhone = normalizePhone(phone || '');
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ error: 'Please provide a valid 10-digit Indian mobile number.' });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ error: 'Password confirmation does not match.' });
      }

      const publicRoles: UserRole[] = ['farmer', 'buyer'];
      const userRole = (role || 'farmer').toLowerCase() as UserRole;
      if (!publicRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Admin accounts cannot be created through public registration. Contact the platform administrator.' });
      }

      // Check duplicates
      const normalizedEmail = email.trim().toLowerCase();
      const existingEmail = users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (existingEmail) {
        return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
      }

      const existingPhone = users.find((u) => normalizePhone(u.phone) === cleanPhone);
      if (existingPhone) {
        return res.status(409).json({ error: 'An account with this mobile number already exists. Please log in.' });
      }

      // Hash password securely
      const { hash, salt } = hashPassword(password);

      // Construct verified user object
      const defaultAvatars = {
        farmer: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
        buyer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        admin: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
      };

      const newUser: StoredUser = {
        id: `user_${userRole}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: fullName.trim(),
        phone: `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
        email: normalizedEmail,
        passwordHash: hash,
        salt,
        role: userRole,
        avatar: defaultAvatars[userRole],
        location: location || {
          villageOrCity: userRole === 'farmer' ? 'Kisan Gram' : 'Agri Trade Hub',
          district: userRole === 'farmer' ? 'Sehore' : 'Central Delhi',
          state: userRole === 'farmer' ? 'Madhya Pradesh' : 'Delhi',
          pincode: userRole === 'farmer' ? '466001' : '110001'
        },
        isVerifiedFPO: isVerifiedFPO || false,
        fpoName: fpoName || undefined,
        businessName: businessName || undefined,
        businessType: businessType || undefined,
        rating: 5.0,
        totalRatingsCount: 1,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveUsersToFile();

      // Synchronize with database data layer
      try {
        const existingInDb = db.getUserByEmailOrPhone(newUser.email) || db.getUserByEmailOrPhone(cleanPhone);
        if (!existingInDb) {
          db.insertUser({
            name: newUser.name,
            phone: cleanPhone,
            email: newUser.email,
            passwordHash: hash,
            salt,
            role: newUser.role,
            avatar: newUser.avatar,
            status: 'active',
            preferredLanguage: 'hi'
          });
        }
      } catch (dbErr) {
        console.warn('[Auth] Database sync warning:', dbErr);
      }

      const token = createSessionToken(newUser);
      const safeUser = sanitizeUser(newUser);

      return res.status(201).json({
        message: 'Registration successful. Welcome to Kisan Saathi!',
        user: safeUser,
        token
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      return res.status(500).json({ error: 'Server error during registration. Please try again.' });
    }
  },

  // Login
  login: (req: Request, res: Response) => {
    try {
      const { identifier, password, requestedRole } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ error: 'Please provide both email/mobile number and password.' });
      }

      const cleanInput = identifier.trim().toLowerCase();
      const cleanPhoneInput = normalizePhone(identifier);

      // Find user by email or mobile number in in-memory list
      let user = users.find((u) => {
        const emailMatch = u.email.toLowerCase() === cleanInput;
        const phoneMatch = cleanPhoneInput.length === 10 && normalizePhone(u.phone) === cleanPhoneInput;
        return emailMatch || phoneMatch;
      });

      // Database fallback: if not in users array, check the database users collection
      if (!user) {
        const dbUser = db.getUserByEmailOrPhone(cleanInput) || (cleanPhoneInput ? db.getUserByEmailOrPhone(cleanPhoneInput) : undefined);
        if (dbUser) {
          user = {
            id: dbUser.id,
            name: dbUser.name,
            phone: dbUser.phone,
            email: dbUser.email,
            passwordHash: dbUser.passwordHash,
            salt: dbUser.salt,
            role: dbUser.role,
            avatar: dbUser.avatar || '',
            location: {
              villageOrCity: 'Central Mandi',
              district: 'Sehore',
              state: 'Madhya Pradesh',
              pincode: '466001'
            },
            rating: 5.0,
            totalRatingsCount: 1,
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            createdAt: dbUser.createdAt
          };
          users.push(user);
          saveUsersToFile();
        }
      }

      if (!user) {
        return res.status(401).json({ error: 'No Kisan Saathi account found matching these credentials.' });
      }

      // Constant-time password verification
      const isMatch = verifyPassword(password, user.passwordHash, user.salt);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password. Please check your credentials and try again.' });
      }

      // Informative notice if user selected a specific role tab different from their registered role
      let roleMismatchWarning: string | undefined;
      if (requestedRole && requestedRole !== user.role) {
        roleMismatchWarning = `Note: Logging in with your registered server-verified role: ${user.role.toUpperCase()}.`;
      }

      const token = createSessionToken(user);
      const safeUser = sanitizeUser(user);

      return res.json({
        message: `Welcome back, ${user.name}!`,
        user: safeUser,
        token,
        warning: roleMismatchWarning
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Server error during login. Please try again.' });
    }
  },

  // Get current user profile (Server Authoritative)
  me: (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;
    return res.json({ user: sanitizeUser(user) });
  },

  // Update profile
  updateProfile: (req: Request, res: Response) => {
    try {
      const currentUser = (req as any).user as StoredUser;
      const { name, phone, location, fpoName, isVerifiedFPO, businessName, businessType } = req.body;

      const userIndex = users.findIndex((u) => u.id === currentUser.id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
      }

      if (name && typeof name === 'string' && name.trim().length >= 2) {
        users[userIndex].name = name.trim();
      }

      if (phone) {
        const clean = normalizePhone(phone);
        if (clean.length === 10) {
          users[userIndex].phone = `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
        }
      }

      if (location) {
        users[userIndex].location = {
          ...users[userIndex].location,
          ...location
        };
      }

      if (fpoName !== undefined) users[userIndex].fpoName = fpoName;
      if (isVerifiedFPO !== undefined) users[userIndex].isVerifiedFPO = Boolean(isVerifiedFPO);
      if (businessName !== undefined) users[userIndex].businessName = businessName;
      if (businessType !== undefined) users[userIndex].businessType = businessType;

      saveUsersToFile();

      return res.json({
        message: 'Profile updated successfully.',
        user: sanitizeUser(users[userIndex])
      });
    } catch (err: any) {
      console.error('Profile update error:', err);
      return res.status(500).json({ error: 'Failed to update profile.' });
    }
  },

  // Request password reset
  forgotPassword: (req: Request, res: Response) => {
    try {
      const { identifier } = req.body;
      if (!identifier) {
        return res.status(400).json({ error: 'Please provide your registered email or mobile number.' });
      }

      const cleanInput = identifier.trim().toLowerCase();
      const cleanPhone = normalizePhone(identifier);

      const user = users.find(
        (u) => u.email.toLowerCase() === cleanInput || (cleanPhone.length === 10 && normalizePhone(u.phone) === cleanPhone)
      );

      if (!user) {
        return res.status(404).json({ error: 'No account registered with this email or mobile number.' });
      }

      // Generate 6-digit OTP code and cryptographic reset token
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

      resetTokens.set(resetToken, {
        userId: user.id,
        otpCode,
        resetToken,
        expiresAt
      });

      return res.json({
        success: true,
        message: `Password reset verification code generated for ${user.email}.`,
        resetToken,
        otpCode, // In development/sandbox mode, returned so user can test the reset flow immediately
        contactMasked: user.email.replace(/(.{2})(.*)(?=@)/, '$1***')
      });
    } catch (err: any) {
      console.error('Forgot password error:', err);
      return res.status(500).json({ error: 'Failed to initiate password reset.' });
    }
  },

  // Reset password using token & OTP
  resetPassword: (req: Request, res: Response) => {
    try {
      const { resetToken, otpCode, newPassword } = req.body;

      if (!resetToken || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Please provide valid reset token and new password (min 6 characters).' });
      }

      const entry = resetTokens.get(resetToken);
      if (!entry || entry.expiresAt < Date.now()) {
        return res.status(400).json({ error: 'Password reset link has expired. Please request a new one.' });
      }

      if (otpCode && entry.otpCode !== otpCode.trim()) {
        return res.status(400).json({ error: 'Invalid 6-digit verification code.' });
      }

      const userIndex = users.findIndex((u) => u.id === entry.userId);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      const { hash, salt } = hashPassword(newPassword);
      users[userIndex].passwordHash = hash;
      users[userIndex].salt = salt;

      // Invalidate token
      resetTokens.delete(resetToken);
      saveUsersToFile();

      return res.json({
        success: true,
        message: 'Your password has been reset securely. You may now sign in.'
      });
    } catch (err: any) {
      console.error('Password reset error:', err);
      return res.status(500).json({ error: 'Failed to reset password.' });
    }
  },

  // Google OAuth / Demo Login
  googleLogin: (req: Request, res: Response) => {
    try {
      const { credential, requestedRole, demoAccount } = req.body;

      // If user is doing one-click Google demo test
      if (demoAccount) {
        const role = (demoAccount.role || 'farmer') as UserRole;
        const existing = users.find((u) => u.role === role);
        if (existing) {
          const token = createSessionToken(existing);
          return res.json({
            message: `Signed in as verified ${role.toUpperCase()} (${existing.name})`,
            user: sanitizeUser(existing),
            token
          });
        }
      }

      // If live Google credential provided or simulated Google profile
      const email = req.body.email || (req.body.profile && req.body.profile.email);
      const name = req.body.name || (req.body.profile && req.body.profile.name) || 'Google User';
      const role = (requestedRole || 'farmer') as UserRole;

      if (!email) {
        return res.status(400).json({
          error: 'Google login requires valid Google account details or client credential.',
          configNotice: 'To enable live Google OAuth in production, configure GOOGLE_CLIENT_ID in environment variables.'
        });
      }

      let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        // Create user from Google
        const dummyPw = hashPassword(crypto.randomBytes(16).toString('hex'));
        user = {
          id: `user_${role}_g_${Date.now()}`,
          name,
          email: email.toLowerCase(),
          phone: '+91 98000 00000',
          passwordHash: dummyPw.hash,
          salt: dummyPw.salt,
          role,
          avatar: req.body.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
          location: {
            villageOrCity: 'Indore',
            district: 'Indore',
            state: 'Madhya Pradesh',
            pincode: '452001'
          },
          rating: 5.0,
          totalRatingsCount: 1,
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          createdAt: new Date().toISOString()
        };
        users.push(user);
        saveUsersToFile();
      }

      const token = createSessionToken(user);
      return res.json({
        message: `Welcome, ${user.name}!`,
        user: sanitizeUser(user),
        token
      });
    } catch (err: any) {
      console.error('Google login error:', err);
      return res.status(500).json({ error: 'Failed to process Google sign-in.' });
    }
  },

  // Server-side route check endpoint
  checkRoleAccess: (req: Request, res: Response) => {
    const requiredRole = req.params.requiredRole as UserRole;
    const user = (req as any).user as StoredUser;

    if (user.role !== requiredRole && user.role !== 'admin') {
      return res.status(403).json({
        authorized: false,
        userRole: user.role,
        requiredRole,
        message: `Access denied. Role ${requiredRole} is required.`
      });
    }

    return res.json({
      authorized: true,
      userRole: user.role,
      requiredRole
    });
  },

  // Update authenticated user's role (farmer/buyer only — admin not publicly selectable)
  updateRole: (req: Request, res: Response) => {
    try {
      const currentUser = (req as any).user as StoredUser;
      const { role } = req.body;

      const allowedRoles: UserRole[] = ['farmer', 'buyer'];
      if (!role || !allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be farmer or buyer.' });
      }

      const userIndex = users.findIndex((u) => u.id === currentUser.id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      users[userIndex].role = role as UserRole;
      saveUsersToFile();

      // Issue a fresh token with the updated role
      const freshToken = createSessionToken(users[userIndex]);
      const safeUser = sanitizeUser(users[userIndex]);

      return res.json({
        message: `Role updated to ${role} successfully.`,
        user: safeUser,
        token: freshToken
      });
    } catch (err: any) {
      console.error('Update role error:', err);
      return res.status(500).json({ error: 'Failed to update role.' });
    }
  }
};

