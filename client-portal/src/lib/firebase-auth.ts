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
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { handleAuthOperation } from './firebase-errors';

// Re-export auth for convenience
export { auth };

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
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your configuration.');
  }
  
  // Validate inputs
  if (!email || !email.trim()) {
    throw new Error('Email é obrigatório');
  }
  if (!password || password.length < 6) {
    throw new Error('Senha deve ter pelo menos 6 caracteres');
  }
  
  try {
    return await handleAuthOperation(
      () => signInWithEmailAndPassword(auth!, email.trim(), password),
      'Erro ao fazer login'
    );
  } catch (error: any) {
    // Log detailed error for debugging
    console.error('Login error details:', {
      error,
      code: error?.code,
      message: error?.message,
      email: email.trim()
    });
    
    // Re-throw with better error message
    throw error;
  }
};

/**
 * Register new user with email and password
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your configuration.');
  }
  return await handleAuthOperation(async () => {
    const userCredential = await createUserWithEmailAndPassword(auth!, email, password);

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
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          name: displayName || userCredential.user.displayName || '',
          role: 'user',
          created_at: serverTimestamp(),
          emailVerified: false,
          provider: 'email'
        });
      } catch (error: any) {
        // Log error but don't fail the registration
        console.error('Error creating user profile:', error);
        // If it's a permission error, the rules need to be updated
        if (error.code !== 'permission-denied') {
          throw error;
        }
      }
    }

    return userCredential;
  }, 'Erro ao criar conta');
};

/**
 * Login with Google
 */
export const loginWithGoogle = async (): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your configuration.');
  }
  return await handleAuthOperation(async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    const userCredential = await signInWithPopup(auth!, provider);

    // Create/update user profile in Firestore (non-blocking)
    const db = getDb();
    if (userCredential.user && db) {
      // Don't await - let it run in background to avoid blocking redirect
      setDoc(
        doc(db, 'users', userCredential.user.uid),
        {
          email: userCredential.user.email,
          name: userCredential.user.displayName || '',
          role: 'user',
          emailVerified: userCredential.user.emailVerified,
          provider: 'google',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        },
        { merge: true }
      ).catch((error: any) => {
        // Log error but don't fail the login
        console.error('Error creating user profile:', error);
        // If it's a permission error, the user profile might already exist
        // or the rules need to be updated
      });
    }

    return userCredential;
  }, 'Erro ao fazer login com Google');
};

/**
 * Reset password
 */
export const resetPassword = async (email: string): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your configuration.');
  }
  return await handleAuthOperation(
    () => sendPasswordResetEmail(auth!, email),
    'Erro ao enviar email de recuperação'
  );
};

/**
 * Logout
 */
export const logout = async (): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your configuration.');
  }
  return await signOut(auth!);
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth?.currentUser || null;
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

