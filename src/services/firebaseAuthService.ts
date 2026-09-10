import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { getFirebaseServices, isFirebaseConfigured } from '../lib/firebase';
import { User, UserRole, SignupData, LoginCredentials, AuthResponse } from '../types';

const defaultAvatars: Record<UserRole, string> = {
  farmer: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
  buyer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  admin: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
};

/**
 * Firestore rejects `undefined` at every nesting level. Optional profile
 * fields must therefore be omitted rather than assigned `undefined`.
 */
function omitUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(omitUndefined) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, fieldValue]) => fieldValue !== undefined)
        .map(([key, fieldValue]) => [key, omitUndefined(fieldValue)])
    ) as T;
  }

  return value;
}

function optionalText(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

// Known demo accounts with guaranteed data
const demoAccounts: Record<string, { user: User; password: string }> = {
  'rameshwar.patel@kisansaathi.in': {
    password: 'Farmer@123',
    user: {
      id: 'user_farmer_1',
      name: 'Rameshwar Patel',
      phone: '+91 98260 44123',
      email: 'rameshwar.patel@kisansaathi.in',
      role: 'farmer',
      avatar: defaultAvatars.farmer,
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
      createdAt: '2023-03-15T00:00:00.000Z'
    }
  },
  'baldev.singh@malwaorganicfpo.org': {
    password: 'Farmer@123',
    user: {
      id: 'usr-farmer-002',
      name: 'Baldev Singh Dhillon',
      phone: '+91 98140 56789',
      email: 'baldev.singh@malwaorganicfpo.org',
      role: 'farmer',
      avatar: defaultAvatars.farmer,
      location: {
        villageOrCity: 'Tarana',
        district: 'Ujjain',
        state: 'Madhya Pradesh',
        pincode: '456006'
      },
      isVerifiedFPO: true,
      fpoName: 'Malwa Organic Farmer Producer Co.',
      rating: 4.9,
      totalRatingsCount: 96,
      joinedDate: 'April 2023',
      createdAt: '2023-04-10T00:00:00.000Z'
    }
  },
  'vikram.aggarwal@bharatagroexports.com': {
    password: 'Buyer@123',
    user: {
      id: 'user_buyer_1',
      name: 'Vikramaditya Aggarwal',
      phone: '+91 98112 55981',
      email: 'vikram.aggarwal@bharatagroexports.com',
      role: 'buyer',
      avatar: defaultAvatars.buyer,
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
      createdAt: '2022-01-10T00:00:00.000Z'
    }
  },
  'admin.compliance@kisansaathi.gov.in': {
    password: 'Admin@123!',
    user: {
      id: 'user_admin_1',
      name: 'Pooja Verma (Compliance Lead)',
      phone: '+91 94140 88219',
      email: 'admin.compliance@kisansaathi.gov.in',
      role: 'admin',
      avatar: defaultAvatars.admin,
      location: {
        villageOrCity: 'Krishi Bhawan',
        district: 'New Delhi',
        state: 'Delhi',
        pincode: '110001'
      },
      rating: 5.0,
      totalRatingsCount: 500,
      joinedDate: 'November 2021',
      createdAt: '2021-11-01T00:00:00.000Z'
    }
  }
};

export const firebaseAuthService = {
  /**
   * Sign Up with Firebase Authentication + Store Profile in Firestore
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    const cleanEmail = data.email.trim().toLowerCase();
    const fpoName = optionalText(data.fpoName);
    const businessName = optionalText(data.businessName);
    const businessType = optionalText(data.businessType);

    if (data.role === 'farmer' && data.isVerifiedFPO && !fpoName) {
      throw new Error('Please enter the registered FPO organization name.');
    }

    // 1. If Firebase is configured with real credentials, perform real Firebase Auth & Firestore
    if (isFirebaseConfigured()) {
      try {
        const { auth, firestore } = getFirebaseServices();
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
        const fbUser = userCredential.user;
        const idToken = await fbUser.getIdToken();

        const newUser = omitUndefined({
          id: fbUser.uid,
          name: data.fullName.trim(),
          phone: data.phone.trim(),
          email: cleanEmail,
          role: data.role,
          avatar: defaultAvatars[data.role],
          location: data.location || {
            villageOrCity: data.role === 'farmer' ? 'Kisan Gram' : 'Agri Trade Hub',
            district: 'Sehore',
            state: 'Madhya Pradesh',
            pincode: '466001'
          },
          isVerifiedFPO: data.isVerifiedFPO || false,
          ...(fpoName ? { fpoName } : {}),
          ...(businessName ? { businessName } : {}),
          ...(businessType ? { businessType } : {}),
          rating: 5.0,
          totalRatingsCount: 1,
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          createdAt: new Date().toISOString()
        }) as User;

        // Save User Document to Firestore: collection 'users'
        await setDoc(doc(firestore, 'users', fbUser.uid), omitUndefined(newUser));

        // Save associated profile if Farmer
        if (data.role === 'farmer') {
          await setDoc(doc(firestore, 'farmerProfiles', fbUser.uid), omitUndefined({
            userId: fbUser.uid,
            farmName: `${data.fullName}'s Farm`,
            village: newUser.location.villageOrCity,
            district: newUser.location.district,
            state: newUser.location.state,
            pincode: newUser.location.pincode,
            ...(fpoName ? { fpoName } : {}),
            isVerifiedFPO: Boolean(data.isVerifiedFPO),
            primaryApmcMandi: 'Sehore APMC Mandi',
            farmingType: 'conventional',
            rating: 5.0,
            totalRatingsCount: 1,
            totalCropsListed: 0,
            totalOrdersFulfilled: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
        }

        return {
          message: 'Registration successful. Welcome to Kisan Saathi!',
          user: newUser,
          token: idToken
        };
      } catch (err: any) {
        console.error('[Firebase Auth] Signup error:', err);
        // Map common Firebase errors to user-friendly messages
        let message = err.message;
        if (err.code === 'auth/email-already-in-use') {
          message = 'An account with this email address already exists. Please log in.';
        } else if (err.code === 'auth/weak-password') {
          message = 'Password should be at least 6 characters.';
        } else if (err.code === 'auth/invalid-email') {
          message = 'The email address is invalid.';
        }
        throw new Error(message);
      }
    }

    // Fallback: When Firebase keys are not yet entered in Vercel environment
    console.warn('[Firebase] Environment variables not yet configured, using local session fallback.');
    const fallbackId = `usr_${Date.now()}`;
    const fallbackUser: User = {
      id: fallbackId,
      name: data.fullName.trim(),
      phone: data.phone.trim(),
      email: cleanEmail,
      role: data.role,
      avatar: defaultAvatars[data.role],
      location: data.location || {
        villageOrCity: 'Kisan Gram',
        district: 'Sehore',
        state: 'Madhya Pradesh',
        pincode: '466001'
      },
      isVerifiedFPO: data.isVerifiedFPO,
      fpoName: data.fpoName,
      businessName: data.businessName,
      businessType: data.businessType,
      rating: 5.0,
      totalRatingsCount: 1,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      createdAt: new Date().toISOString()
    };
    const mockToken = `ks_token_${fallbackId}_${Date.now()}`;
    return {
      message: 'Account created successfully!',
      user: fallbackUser,
      token: mockToken
    };
  },

  /**
   * Log In with Firebase Authentication + Fetch Profile from Firestore
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const rawIdentifier = credentials.identifier.trim().toLowerCase();
    const cleanPhone = rawIdentifier.replace(/\D/g, '').slice(-10);

    // Check demo accounts first (for 1-click test logins)
    const demo = demoAccounts[rawIdentifier];
    if (demo && credentials.password === demo.password) {
      const demoToken = `ks_demo_jwt_${demo.user.id}_${Date.now()}`;
      return {
        user: demo.user,
        token: demoToken,
        message: 'Logged in successfully with demo account'
      };
    }

    if (isFirebaseConfigured()) {
      try {
        const { auth, firestore } = getFirebaseServices();
        let loginEmail = rawIdentifier;

        // If user typed a phone number, look up their email in Firestore
        if (!rawIdentifier.includes('@') && cleanPhone.length === 10) {
          const q = query(collection(firestore, 'users'), where('phone', '==', cleanPhone));
          const snap = await getDocs(q);
          if (!snap.empty) {
            loginEmail = snap.docs[0].data().email;
          } else {
            // Also try with +91 prefix
            const q2 = query(collection(firestore, 'users'), where('phone', '==', `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`));
            const snap2 = await getDocs(q2);
            if (!snap2.empty) {
              loginEmail = snap2.docs[0].data().email;
            }
          }
        }

        // Firebase Auth sign-in
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, credentials.password);
        const fbUser = userCredential.user;
        const idToken = await fbUser.getIdToken();

        // Fetch User profile from Firestore
        const userDocRef = doc(firestore, 'users', fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        let userProfile: User;

        if (userDocSnap.exists()) {
          userProfile = userDocSnap.data() as User;
        } else {
          // If user exists in Auth but not Firestore (e.g. created in console), synthesize doc
          userProfile = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Kisan Saathi User',
            email: fbUser.email || loginEmail,
            phone: fbUser.phoneNumber || '',
            role: credentials.requestedRole || 'farmer',
            avatar: fbUser.photoURL || defaultAvatars[credentials.requestedRole || 'farmer'],
            location: {
              villageOrCity: 'Central Mandi',
              district: 'Sehore',
              state: 'Madhya Pradesh',
              pincode: '466001'
            },
            rating: 5.0,
            totalRatingsCount: 1,
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, omitUndefined(userProfile));
        }

        return {
          user: userProfile,
          token: idToken,
          message: 'Welcome back!'
        };
      } catch (err: any) {
        console.error('[Firebase Auth] Login error:', err);
        let message = 'Invalid email/mobile number or password.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          message = 'No Kisan Saathi account found matching these credentials, or password was incorrect.';
        } else if (err.code === 'auth/too-many-requests') {
          message = 'Access to this account has been temporarily disabled due to many failed login attempts. Try again later or reset password.';
        }
        throw new Error(message);
      }
    }

    // Fallback if Firebase environment variables are pending on Vercel
    throw new Error('Firebase Authentication is not yet configured. Please set the VITE_FIREBASE_* environment variables in Vercel, or use the 1-Click Demo Logins.');
  },

  /**
   * Fetch current user profile from Firestore using UID
   */
  async fetchUserProfile(uid: string): Promise<User | null> {
    if (!isFirebaseConfigured()) return null;
    try {
      const { firestore } = getFirebaseServices();
      const snap = await getDoc(doc(firestore, 'users', uid));
      if (snap.exists()) {
        return snap.data() as User;
      }
      return null;
    } catch (err) {
      console.error('[Firebase] fetchUserProfile error:', err);
      return null;
    }
  },

  /**
   * Update User Profile in Firestore
   */
  async updateProfile(uid: string, updates: Partial<User>): Promise<User> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured');
    }
    const { firestore } = getFirebaseServices();
    const userDocRef = doc(firestore, 'users', uid);
    await updateDoc(userDocRef, omitUndefined({
      ...updates,
      updatedAt: new Date().toISOString()
    }));

    const refreshed = await getDoc(userDocRef);
    return refreshed.data() as User;
  },

  /**
   * Sign Out from Firebase
   */
  async logout(): Promise<void> {
    if (isFirebaseConfigured()) {
      try {
        const { auth } = getFirebaseServices();
        await signOut(auth);
      } catch (e) {
        // Non-fatal
      }
    }
  },

  /**
   * Send Password Reset Email via Firebase
   */
  async sendPasswordReset(email: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured yet. Please configure VITE_FIREBASE_* on Vercel.');
    }
    const { auth } = getFirebaseServices();
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Sign In With Google via Firebase Auth + Firestore
   */
  async loginWithGoogle(role: UserRole = 'farmer'): Promise<AuthResponse> {
    if (!isFirebaseConfigured()) {
      throw new Error('Google Sign-In requires Firebase to be configured with VITE_FIREBASE_* environment variables.');
    }
    const { auth, firestore } = getFirebaseServices();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    const idToken = await fbUser.getIdToken();

    // Check if user already exists in Firestore
    const userDocRef = doc(firestore, 'users', fbUser.uid);
    const snap = await getDoc(userDocRef);

    let user: User;
    if (snap.exists()) {
      user = snap.data() as User;
    } else {
      user = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Google User',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        role,
        avatar: fbUser.photoURL || defaultAvatars[role],
        location: {
          villageOrCity: 'Central Mandi',
          district: 'Sehore',
          state: 'Madhya Pradesh',
          pincode: '466001'
        },
        rating: 5.0,
        totalRatingsCount: 1,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, omitUndefined(user));
    }

    return { user, token: idToken };
  }
};
