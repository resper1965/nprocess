"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import {
  User,
  onAuthStateChanged,
  getIdTokenResult
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { loginWithEmail, loginWithGoogle, registerWithEmail, resetPassword, logout, getUserProfile } from "./firebase-auth";
import { auth } from "./firebase-config";
import { LoginData, RegisterData } from "@/types/auth";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  role: string | null;
  isAdmin: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user role from token or Firestore
  const loadUserRole = async (user: User): Promise<string> => {
    try {
      const tokenResult = await getIdTokenResult(user);
      let userRole = tokenResult.claims.role as string | undefined;

      console.log('loadUserRole: Token claims', {
        uid: user.uid,
        email: user.email,
        customClaims: tokenResult.claims,
        roleFromClaim: userRole
      });

      // Only check Firestore if no custom claim exists (undefined/null)
      if (!userRole) {
        console.log('loadUserRole: No custom claim, checking Firestore...');
        try {
          const userProfile = await getUserProfile(user.uid);
          console.log('loadUserRole: Firestore profile', {
            uid: user.uid,
            profile: userProfile,
            hasProfile: !!userProfile,
            roleFromFirestore: userProfile?.role
          });

          if (userProfile && userProfile.role) {
            userRole = userProfile.role;
            console.log('loadUserRole: Using role from Firestore:', userRole);
          } else {
            console.warn('loadUserRole: No role in Firestore, defaulting to "user"');
          }
        } catch (fsError) {
          console.error("loadUserRole: Error fetching user profile from Firestore:", fsError);
        }
      } else {
        console.log('loadUserRole: Using role from custom claim:', userRole);
      }

      const finalRole = userRole || 'user';
      console.log('loadUserRole: Final role determined', {
        uid: user.uid,
        email: user.email,
        finalRole,
        isAdmin: finalRole === 'admin' || finalRole === 'super_admin'
      });

      return finalRole;
    } catch (error) {
      console.error("loadUserRole: Error loading user role:", error);
      return 'user';
    }
  };

  // Handle redirect for authenticated users
  const handleAuthenticatedRedirect = (userRole: string) => {
    if (typeof window === 'undefined') return;
    
    const currentPath = window.location.pathname;
    const publicPages = ['/login', '/login/', '/register', '/'];
    const isPublicPage = publicPages.includes(currentPath);
    
    if (isPublicPage) {
      const targetPath = (userRole === 'admin' || userRole === 'super_admin') 
        ? '/admin/overview' 
        : '/dashboard';
      
      console.log('handleAuthenticatedRedirect: Redirecting from', currentPath, 'to', targetPath, { role: userRole });
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        if (window.location.pathname === currentPath) {
          router.push(targetPath);
        }
      }, 300);
    }
  };

  // Main auth state listener - ONLY uses onAuthStateChanged (no redirect logic)
  useEffect(() => {
    if (!auth) {
      console.warn('AuthProvider: Firebase Auth not initialized, setting loading to false');
      setLoading(false);
      return;
    }

    // Wait a bit to ensure Firebase is fully initialized
    let mounted = true;
    let unsubscribe: (() => void) | null = null;
    let retryCount = 0;
    const maxRetries = 3;
    const maxWaitTime = 10000; // 10 seconds max wait time

    // Safety timeout - ensure loading doesn't stay true forever
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('AuthProvider: Safety timeout reached, setting loading to false');
        setLoading(false);
      }
    }, maxWaitTime);

    const setupAuthListener = () => {
      if (!mounted || !auth) return;

      try {
        // Set up auth state listener - this is the ONLY source of truth
        unsubscribe = onAuthStateChanged(
          auth,
          async (currentUser) => {
            if (!mounted) return;

            console.log('onAuthStateChanged: Auth state changed', { 
              hasUser: !!currentUser, 
              uid: currentUser?.uid,
              email: currentUser?.email,
              retryCount
            });

            if (currentUser) {
              setUser(currentUser);
              
              try {
                // Load role
                const userRole = await loadUserRole(currentUser);
                setRole(userRole);
                
                // Handle redirect if on public page
                handleAuthenticatedRedirect(userRole);
                
                // Log super_admin status
                if (userRole === 'super_admin') {
                  console.log('⭐ SUPER ADMIN DETECTED!', {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    role: userRole
                  });
                }
              } catch (roleError) {
                console.error('onAuthStateChanged: Error loading user role:', roleError);
                // Set default role if loading fails
                setRole('user');
              }
            } else {
              console.log('onAuthStateChanged: No user, clearing auth state');
              setUser(null);
              setRole(null);
            }
            
            setLoading(false);
            retryCount = 0; // Reset retry count on successful callback
          },
          (error: any) => {
            // Error callback for onAuthStateChanged
            console.error('onAuthStateChanged: Error in auth state listener:', error);
            setLoading(false);
            
            // Don't retry on auth errors - just clear state
            const errorCode = error?.code || error?.message;
            if (errorCode === 'auth/network-request-failed' || errorCode === 'auth/too-many-requests') {
              console.warn('onAuthStateChanged: Network or rate limit error, will retry...');
              if (retryCount < maxRetries && mounted) {
                retryCount++;
                console.log(`onAuthStateChanged: Retrying auth listener (attempt ${retryCount}/${maxRetries})...`);
                setTimeout(() => {
                  if (mounted && auth) {
                    setupAuthListener();
                  }
                }, 1000 * retryCount); // Exponential backoff
                return;
              }
            }
            
            // For other errors, just clear state
            console.error('onAuthStateChanged: Auth error, clearing state');
            setUser(null);
            setRole(null);
          }
        );
      } catch (error) {
        console.error('AuthProvider: Error setting up auth listener:', error);
        setLoading(false);
      }
    };

    // Small delay to ensure Firebase is fully initialized
    const initTimeout = setTimeout(() => {
      if (mounted) {
        setupAuthListener();
      }
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      clearTimeout(safetyTimeout);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Empty deps - auth listener should only be set up once

  const handleLogin = async (data: LoginData) => {
    try {
      const credential = await loginWithEmail(data.email, data.password);
      
      // Wait a bit for auth state to update via onAuthStateChanged
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get role to determine redirect path
      if (credential?.user) {
        const userRole = await loadUserRole(credential.user);
        setRole(userRole);
        
        const targetPath = (userRole === 'admin' || userRole === 'super_admin') 
          ? '/admin/overview' 
          : '/dashboard';
        
        console.log('handleLogin: Login successful, redirecting to:', targetPath, { role: userRole });
        
        router.push(targetPath);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Erro ao fazer login';
      
      if (error?.userMessage) {
        errorMessage = error.userMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      console.log('handleLoginWithGoogle: Starting Google login...');
      
      // Use signInWithPopup - returns UserCredential | null
      const credential = await loginWithGoogle();
      
      // CRITICAL: TypeScript safety check - signInWithPopup can return null if popup is closed
      if (!credential || !credential.user) {
        console.log('handleLoginWithGoogle: No credential returned (popup closed/blocked), waiting for auth state change...');
        return; // Exit early - onAuthStateChanged will handle state update if user actually logged in
      }
      
      console.log('handleLoginWithGoogle: Google login successful', { 
        uid: credential.user.uid,
        email: credential.user.email 
      });
      
      // Wait a bit for auth state to update via onAuthStateChanged
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get role to determine redirect path
      const userRole = await loadUserRole(credential.user);
      setRole(userRole);
      
      const targetPath = (userRole === 'admin' || userRole === 'super_admin') 
        ? '/admin/overview' 
        : '/dashboard';
      
      console.log('handleLoginWithGoogle: Redirecting to:', targetPath, { role: userRole });
      
      router.push(targetPath);
    } catch (error: any) {
      console.error('Google login failed:', error);
      
      let errorMessage = 'Erro ao fazer login com Google';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Show toast for popup blocked
      if (error?.code === 'auth/popup-blocked' || errorMessage.toLowerCase().includes('popup bloqueado')) {
        toast.error('Popup bloqueado', {
          description: 'Por favor, permita popups para este site e tente novamente.',
          duration: 5000
        });
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      await registerWithEmail(data.email, data.password, data.name);
      router.push('/dashboard');
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta');
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao enviar email de reset');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setRole(null);
      router.push('/login');
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer logout');
    }
  };

  const isAdmin = role === 'admin' || role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        loading,
        isAuthenticated: !!user,
        login: handleLogin,
        loginWithGoogle: handleLoginWithGoogle,
        register: handleRegister,
        resetPassword: handleResetPassword,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
