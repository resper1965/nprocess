/**
 * Firebase Authentication helpers
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  User,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase-config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

// Initialize Firestore (only in browser)
const getDb = () => {
  if (typeof window === 'undefined') return null;
  return getFirestore();
};

/**
 * Login with email and password
 */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/**
 * Register new user with email and password
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update display name if provided
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  
  // Send email verification
  if (userCredential.user) {
    await sendEmailVerification(userCredential.user);
  }
  
  // Create user profile in Firestore
  const db = getDb();
  if (userCredential.user && db) {
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      name: displayName || userCredential.user.displayName || '',
      role: 'user',
      created_at: new Date(),
      emailVerified: false
    });
  }
  
  return userCredential;
};

/**
 * Login with Google
 */
export const loginWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  
  const userCredential = await signInWithPopup(auth, provider);
  
  // Create/update user profile in Firestore
  const db = getDb();
  if (userCredential.user && db) {
    await setDoc(
      doc(db, 'users', userCredential.user.uid),
      {
        email: userCredential.user.email,
        name: userCredential.user.displayName || '',
        role: 'user',
        emailVerified: userCredential.user.emailVerified,
        provider: 'google',
        updated_at: new Date()
      },
      { merge: true }
    );
  }
  
  return userCredential;
};

/**
 * Reset password
 */
export const resetPassword = async (email: string): Promise<void> => {
  return await sendPasswordResetEmail(auth, email);
};

/**
 * Logout
 */
export const logout = async (): Promise<void> => {
  return await signOut(auth);
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId: string) => {
  const db = getDb();
  if (!db) return null;
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

