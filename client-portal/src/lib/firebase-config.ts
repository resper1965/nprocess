/**
 * Firebase configuration and initialization
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getMessaging, Messaging } from 'firebase/messaging';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { validateFirebaseConfig, logFirebaseConfigStatus } from './firebase-config-validator';

// Validate configuration on module load
if (typeof window !== 'undefined') {
  const validation = validateFirebaseConfig();

  if (!validation.valid) {
    logFirebaseConfigStatus();
    throw new Error(
      `Firebase configuration is invalid. Missing: ${validation.missing.join(', ')}`
    );
  }

  // Log warnings in development
  if (process.env.NODE_ENV === 'development' && validation.warnings.length > 0) {
    logFirebaseConfigStatus();
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCoTXUGWWoKS8hJFM8z5BgSljcigX2cum8',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'nprocess-33a44.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nprocess-33a44',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'nprocess-33a44.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '406039759652',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:406039759652:web:fbfdcdcb317bb1087201b1',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-P6S9KBLDXH',
};

// Initialize Firebase (only once)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

// Initialize messaging (only in browser)
export const messaging: Messaging | null = 
  typeof window !== 'undefined' ? getMessaging(app) : null;

// Initialize analytics (only in browser)
export const analytics: Analytics | null = 
  typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

