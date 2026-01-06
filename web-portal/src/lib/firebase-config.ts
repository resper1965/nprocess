/**
 * Firebase configuration and initialization
 * Enhanced to handle Tracking Prevention in browsers like Edge and Safari
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getMessaging, Messaging } from 'firebase/messaging';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { validateFirebaseConfig, logFirebaseConfigStatus } from './firebase-config-validator';

// Validate configuration on module load (only in browser)
// Note: We don't throw errors here because we have default values hardcoded
// This validation is just for logging purposes
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const validation = validateFirebaseConfig();

  if (!validation.valid) {
    console.warn('⚠️  Firebase Configuration Warning:');
    console.warn('   Some environment variables are missing, but using default values.');
    console.warn('   Missing:', validation.missing.join(', '));
    console.warn('   For production, set these in your environment variables.');
  }

  if (validation.warnings.length > 0) {
    validation.warnings.forEach((warning) => {
      console.warn(`   - ${warning}`);
    });
  }
}

// Firebase configuration with default values
// These defaults are used when environment variables are not set
// Production defaults: nprocess-8e801 (nProcess)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBmA2rJyawq83redy2d2BGjlgTog1_NXmM',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'nprocess-8e801.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nprocess-8e801',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'nprocess-8e801.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '43006907338',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:43006907338:web:f8666ae921f4a584fff533',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-34RLW0TPXS',
};

// Initialize Firebase (only in browser)
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let storageInstance: FirebaseStorage | null = null;
let messagingInstance: Messaging | null = null;
let analyticsInstance: Analytics | null = null;

if (typeof window !== 'undefined') {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Initialize services (only in browser)
  authInstance = getAuth(app);
  
  // Configure auth persistence to handle Tracking Prevention
  if (authInstance) {
    console.log('🔐 Configuring Firebase Auth persistence...');
    
    // Try to set persistence - use IndexedDB first, fallback to session storage
    // This helps with browsers that have Tracking Prevention enabled
    const configurePersistence = async () => {
      try {
        // Try IndexedDB first (most compatible with Tracking Prevention)
        await setPersistence(authInstance!, indexedDBLocalPersistence);
        console.log('✅ Firebase Auth: Using IndexedDB persistence');
      } catch (indexedDBError: any) {
        console.warn('⚠️  IndexedDB persistence failed, trying localStorage...', indexedDBError?.code || indexedDBError?.message);
        
        try {
          // Fallback to localStorage
          await setPersistence(authInstance!, browserLocalPersistence);
          console.log('✅ Firebase Auth: Using localStorage persistence');
        } catch (localStorageError: any) {
          console.warn('⚠️  localStorage persistence failed, using session storage...', localStorageError?.code || localStorageError?.message);
          
          try {
            // Last fallback: session storage (cleared when tab closes)
            await setPersistence(authInstance!, browserSessionPersistence);
            console.log('⚠️  Firebase Auth: Using session persistence (will be lost on tab close)');
          } catch (sessionError: any) {
            console.error('❌ All persistence methods failed!', sessionError);
            console.error('🚫 Tracking Prevention may be blocking Firebase Auth.');
            console.error('💡 Solution: Disable Tracking Prevention for this site in browser settings.');
  }
        }
      }
    };
    
    // Call async persistence configuration
    configurePersistence().catch((error) => {
      console.error('Failed to configure Firebase Auth persistence:', error);
    });
    
    // Disable app verification for testing (only in development)
    if (process.env.NODE_ENV === 'development') {
      authInstance.settings.appVerificationDisabledForTesting = false;
    }
  }
  
  storageInstance = getStorage(app);
  
  try {
    messagingInstance = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging initialization failed:', error);
  }
  
  try {
    analyticsInstance = getAnalytics(app);
  } catch (error) {
    console.warn('Firebase Analytics initialization failed:', error);
  }
}

// Export services (will be null on server)
export const auth: Auth | null = authInstance;
export const storage: FirebaseStorage | null = storageInstance;
export const messaging: Messaging | null = messagingInstance;
export const analytics: Analytics | null = analyticsInstance;

export default app;

