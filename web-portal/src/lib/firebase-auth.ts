/**
 * Firebase Authentication helpers
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
 * Login with Google using redirect (more reliable than popup)
 * This avoids issues with third-party cookies being blocked
 */
export const loginWithGoogle = async (): Promise<void> => {
  console.log('loginWithGoogle: Starting Google login process...');
  
  if (!auth) {
    console.error('loginWithGoogle: Firebase Auth is not initialized!');
    throw new Error('Firebase Auth is not initialized. Please check your configuration.');
  }
  
  console.log('loginWithGoogle: Firebase Auth is initialized', { authDomain: auth.app.options.authDomain });
  
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    console.log('loginWithGoogle: GoogleAuthProvider created');
    
    // Store the current URL to redirect back after Google auth
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_redirect_url', window.location.pathname);
      console.log('loginWithGoogle: Stored redirect URL:', window.location.pathname);
    }
    
    console.log('loginWithGoogle: Calling signInWithRedirect...');
    
    // Use redirect instead of popup to avoid third-party cookie issues
    await signInWithRedirect(auth, provider);
    
    console.log('loginWithGoogle: signInWithRedirect called successfully - redirect should happen now');
    
    // Note: signInWithRedirect doesn't return a credential
    // The redirect will happen and the user will be redirected back
    // Use handleGoogleRedirect() to process the result after redirect
  } catch (error: any) {
    console.error('loginWithGoogle: Error initiating Google login:', error);
    console.error('loginWithGoogle: Error details:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    
    // Check for tracking prevention / storage blocked errors
    const errorMessageLower = (error?.message || '').toLowerCase();
    const isTrackingPrevention = errorMessageLower.includes('tracking prevention') || 
                                  errorMessageLower.includes('storage') ||
                                  errorMessageLower.includes('blocked') ||
                                  error?.code === 'auth/network-request-failed';
    
    // Provide more specific error messages
    let errorMessage = 'Erro ao iniciar login com Google. Por favor, tente novamente.';
    
    if (isTrackingPrevention) {
      errorMessage = 'Seu navegador está bloqueando o acesso necessário para o login com Google. ' +
                     'Por favor, desative a "Prevenção de Rastreamento" nas configurações do navegador ' +
                     'ou use outro navegador (Chrome, Firefox).';
    } else if (error?.code) {
      switch (error.code) {
        case 'auth/operation-not-allowed':
          errorMessage = 'Login com Google não está habilitado. Entre em contato com o suporte.';
          break;
        case 'auth/configuration-not-found':
          errorMessage = 'Configuração do Firebase não encontrada. Verifique as configurações.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = 'Domínio não autorizado. Verifique as configurações do Firebase.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de rede. Verifique sua conexão e tente novamente. ' +
                         'Se o problema persistir, pode ser bloqueio de rastreamento do navegador.';
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

/**
 * Handle Google login redirect result
 * Call this after a page load to check if user returned from Google OAuth
 */
export const handleGoogleRedirect = async (): Promise<UserCredential | null> => {
  if (!auth) {
    return null;
  }
  
  try {
    const result = await getRedirectResult(auth);
    
    if (result) {
      console.log('handleGoogleRedirect: Google redirect result received', { uid: result.user.uid, email: result.user.email });
      
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
          // Log error but don't fail the login
          console.error('Error creating user profile:', error);
        });
      }
      
      return result;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error handling Google redirect:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error('Login cancelado. Por favor, tente novamente.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup bloqueado pelo navegador. Por favor, permita popups para este site.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Erro ao fazer login com Google. Por favor, tente novamente.');
    }
  }
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

