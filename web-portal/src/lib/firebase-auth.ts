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
 * Detect if browser is Edge
 */
const isEdgeBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent;
  return userAgent.includes('Edg/') || userAgent.includes('Edge/');
};

/**
 * Login with Google using popup
 * Returns UserCredential or null if popup is blocked/cancelled
 */
export const loginWithGoogle = async (): Promise<UserCredential | null> => {
  console.log('loginWithGoogle: Starting Google login process...');
  
  if (!auth) {
    console.error('loginWithGoogle: Firebase Auth is not initialized!');
    throw new Error('Firebase Auth is not initialized. Please check your configuration.');
  }
  
  // Check if using custom domain
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'N/A';
  const isCustomDomain = hostname === 'nprocess.ness.com.br';
  
  console.log('loginWithGoogle: Firebase Auth is initialized', { 
    authDomain: auth.app.options.authDomain,
    currentHostname: hostname,
    isCustomDomain: isCustomDomain
  });
  
  // Warn if using custom domain
  if (isCustomDomain) {
    console.warn('⚠️ Using custom domain nprocess.ness.com.br');
    console.warn('   Ensure it is configured in:');
    console.warn('   1. Firebase Auth - Authorized domains');
    console.warn('   2. Google OAuth - Authorized JavaScript origins');
    console.warn('   3. Google OAuth - Authorized redirect URIs');
  }
  
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    console.log('loginWithGoogle: GoogleAuthProvider created');
    
    console.log('loginWithGoogle: Calling signInWithPopup...');
    const result = await signInWithPopup(auth, provider);
    console.log('loginWithGoogle: signInWithPopup completed successfully', { uid: result.user.uid });
    
    // Verificar se o resultado é válido
    if (!result) {
      console.log('loginWithGoogle: signInWithPopup returned null');
      return null;
    }
    
    // User successfully signed in with Google
    const db = getDb();
    if (result.user && db) {
      // Create/update user profile in Firestore (non-blocking)
      setDoc(
        doc(db, 'users', result.user.uid),
        {
          email: result.user.email,
          name: result.user.displayName || '',
          role: 'user',
          emailVerified: result.user.emailVerified,
          provider: 'google',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        },
        { merge: true }
      ).catch((error: any) => {
        console.error('Error creating user profile:', error);
      });
    }
    
    return result;
  } catch (error: any) {
    console.error('loginWithGoogle: Error initiating Google login:', error);
    console.error('loginWithGoogle: Error details:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    
    let errorMessage = 'Erro ao iniciar login com Google. Por favor, tente novamente.';
    
    if (error?.code) {
      switch (error.code) {
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
          errorMessage = 'Login cancelado. Por favor, tente novamente.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup bloqueado pelo navegador. Por favor, permita popups para este site.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Login com Google não está habilitado. Entre em contato com o suporte.';
          break;
        case 'auth/configuration-not-found':
          errorMessage = 'Configuração do Firebase não encontrada. Verifique as configurações.';
          break;
        case 'auth/unauthorized-domain':
          if (isCustomDomain) {
            errorMessage = 'Domínio customizado não autorizado. Adicione "nprocess.ness.com.br" em:\n1. Firebase Auth → Authorized domains\n2. Google OAuth → Authorized JavaScript origins\n3. Google OAuth → Authorized redirect URIs';
          } else {
            errorMessage = 'Domínio não autorizado. Verifique as configurações do Firebase.';
          }
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de rede. Verifique sua conexão e tente novamente.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

// Removed handleGoogleRedirect - we now use signInWithPopup exclusively

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

/**
 * Check if browser has Tracking Prevention enabled
 * This is a best-effort detection that tests storage availability
 */
export const checkTrackingPreventionStatus = async (): Promise<{
  blocked: boolean;
  reason?: string;
}> => {
  if (typeof window === 'undefined') {
    return { blocked: false };
  }

  try {
    // Test localStorage
    const testKey = '__firebase_test_' + Date.now();
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    // Test IndexedDB
    const dbTest = indexedDB.open('__test_db__');
    await new Promise((resolve, reject) => {
      dbTest.onsuccess = resolve;
      dbTest.onerror = reject;
      dbTest.onblocked = reject;
      setTimeout(reject, 1000); // Timeout after 1s
    });
    
    // If we got here, storage is available
    return { blocked: false };
  } catch (error: any) {
    console.error('Storage test failed:', error);
    
    // Check for specific Tracking Prevention errors
    const errorMessage = error?.message || error?.toString() || '';
    const isTrackingPrevention = 
      errorMessage.toLowerCase().includes('tracking prevention') ||
      errorMessage.toLowerCase().includes('storage') ||
      errorMessage.toLowerCase().includes('blocked') ||
      errorMessage.toLowerCase().includes('quotaexceedederror') ||
      error?.name === 'QuotaExceededError' ||
      error?.name === 'SecurityError';
    
    return {
      blocked: true,
      reason: isTrackingPrevention
        ? 'Tracking Prevention detectado bloqueando storage'
        : 'Storage não disponível: ' + errorMessage
    };
  }
};