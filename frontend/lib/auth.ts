/**
 * Authentication Utilities
 * 
 * Helper functions for Firebase authentication operations.
 */

import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  User,
  IdTokenResult
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

/**
 * Custom claims extracted from Firebase ID token.
 */
export interface CustomClaims {
  org_id?: string;
  role?: 'super_admin' | 'org_admin' | 'developer' | 'guest';
  status?: 'active' | 'pending' | 'suspended';
}

/**
 * Extended user info with custom claims.
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  claims: CustomClaims;
}

/**
 * Sign in with Google popup.
 */
export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
}

/**
 * Get custom claims from the current user's ID token.
 */
export async function getCustomClaims(user: User): Promise<CustomClaims> {
  const tokenResult: IdTokenResult = await user.getIdTokenResult();
  return {
    org_id: tokenResult.claims.org_id as string | undefined,
    role: tokenResult.claims.role as CustomClaims['role'],
    status: tokenResult.claims.status as CustomClaims['status'],
  };
}

/**
 * Get the ID token for API calls.
 */
export async function getIdToken(user: User): Promise<string> {
  return user.getIdToken();
}
