import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration from Vite environment variables
// On Vercel, set these in Project Settings -> Environment Variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check if Firebase configuration is provided
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

// Never initialize a placeholder Firebase project. It hides missing Vercel
// variables and sends production traffic to a project that does not exist.
const configured = isFirebaseConfigured();
export const app: FirebaseApp | null = configured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;
export const auth: Auth | null = app ? getAuth(app) : null;
export const firestore: Firestore | null = app ? getFirestore(app) : null;

export function getFirebaseServices(): { app: FirebaseApp; auth: Auth; firestore: Firestore } {
  if (!app || !auth || !firestore) {
    throw new Error(
      'Firebase is not configured. Add all VITE_FIREBASE_* variables in Vercel and redeploy.'
    );
  }
  return { app, auth, firestore };
}
