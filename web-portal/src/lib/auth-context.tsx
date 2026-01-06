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
import { loginWithEmail, loginWithGoogle, handleGoogleRedirect, registerWithEmail, resetPassword, logout, getUserProfile } from "./firebase-auth";
import { auth } from "./firebase-config";
import { LoginData, RegisterData } from "@/types/auth"; 

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

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // Check for Google redirect result on mount
    const checkRedirectResult = async () => {
      console.log('checkRedirectResult: Checking for Google redirect result...', {
        currentUser: auth?.currentUser?.uid || 'none',
        path: typeof window !== 'undefined' ? window.location.pathname : 'N/A'
      });
      
      try {
        const result = await handleGoogleRedirect();
        
        // Also check if currentUser exists (in case getRedirectResult already consumed the result)
        const currentUser = auth?.currentUser || null;
        
        console.log('checkRedirectResult: After handleGoogleRedirect', {
          hasResult: !!result,
          hasResultUser: !!result?.user,
          hasCurrentUser: !!currentUser,
          resultUid: result?.user?.uid || 'none',
          currentUserUid: currentUser?.uid || 'none'
        });
        
        // Use result.user if available, otherwise use currentUser
        const userToUse = result?.user || currentUser;
        
        if (userToUse) {
          // User successfully signed in via redirect
          console.log('checkRedirectResult: User authenticated', { uid: userToUse.uid, email: userToUse.email });
          
          // Update state immediately
          setUser(userToUse);
          
          // Wait a bit to ensure auth state is updated
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Get role to determine redirect path
          try {
            const tokenResult = await getIdTokenResult(userToUse);
            let userRole = (tokenResult.claims.role as string) || 'user';
            
            // Check Firestore if no custom claim
            if (!userRole || userRole === 'user') {
              try {
                const userProfile = await getUserProfile(userToUse.uid);
                if (userProfile && userProfile.role) {
                  userRole = userProfile.role;
                }
              } catch (fsError) {
                console.error("checkRedirectResult: Error fetching user profile:", fsError);
              }
            }
            
            const finalRole = userRole || 'user';
            setRole(finalRole);
            const targetPath = finalRole === 'admin' || finalRole === 'super_admin' ? '/admin/overview' : '/dashboard';
            
            console.log('checkRedirectResult: Google login successful, redirecting to:', targetPath, { uid: userToUse.uid, role: finalRole });
            
            // Redirect immediately after successful Google login
            if (typeof window !== 'undefined') {
              // Clear any stored redirect URL
              sessionStorage.removeItem('auth_redirect_url');
              
              // Wait a bit more to ensure everything is ready
              await new Promise(resolve => setTimeout(resolve, 300));
              
              // Immediate redirect
              router.push(targetPath);
              
              // Multiple fallback redirects with longer delays
              const redirectAttempts = [500, 1000, 2000, 3000, 4000];
              redirectAttempts.forEach((delay) => {
                setTimeout(() => {
                  const stillOnPublicPage = window.location.pathname === '/' || 
                                           window.location.pathname === '/login' ||
                                           window.location.pathname === '/login/' ||
                                           window.location.pathname === '/register';
                  if (stillOnPublicPage) {
                    console.log(`checkRedirectResult: Router.push failed, forcing redirect after ${delay}ms to`, targetPath);
                    window.location.href = targetPath;
                  }
                }, delay);
              });
            }
          } catch (roleError) {
            console.error('checkRedirectResult: Error getting user role:', roleError);
            setRole('user');
            // Still redirect to dashboard even if role fetch fails
            if (typeof window !== 'undefined') {
              router.push('/dashboard');
              setTimeout(() => {
                if (window.location.pathname === '/login' || window.location.pathname === '/login/' || window.location.pathname === '/') {
                  window.location.href = '/dashboard';
                }
              }, 1000);
            }
          }
        } else {
          console.log('checkRedirectResult: No user found (no redirect result and no currentUser)');
        }
      } catch (error) {
        console.error('checkRedirectResult: Error handling Google redirect:', error);
        // Don't set error here, let the login page handle it
      }
    };

    // Set up auth state listener first, then check for redirect result
    // This ensures we catch the auth state change even if getRedirectResult doesn't return
    let redirectHandled = false;
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('onAuthStateChanged: Auth state changed', { 
        hasUser: !!currentUser, 
        uid: currentUser?.uid,
        email: currentUser?.email,
        path: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
        currentUserFromAuth: auth?.currentUser?.uid || 'none',
        redirectHandled
      });
      
      // If we have a user and haven't handled redirect yet, check if it's from Google redirect
      if (currentUser && !redirectHandled) {
        // Check if we're coming from a redirect (check URL params or sessionStorage)
        const isFromRedirect = typeof window !== 'undefined' && (
          window.location.search.includes('__firebase_request_key') ||
          sessionStorage.getItem('auth_redirect_url') !== null ||
          window.location.pathname === '/login' || 
          window.location.pathname === '/login/'
        );
        
        if (isFromRedirect) {
          console.log('onAuthStateChanged: User detected after redirect, handling...', { uid: currentUser.uid });
          redirectHandled = true;
          
          // Wait a bit to ensure everything is ready
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Get role and redirect
          try {
            const tokenResult = await getIdTokenResult(currentUser);
            let userRole = (tokenResult.claims.role as string) || 'user';
            
            if (!userRole || userRole === 'user') {
              try {
                const userProfile = await getUserProfile(currentUser.uid);
                if (userProfile && userProfile.role) {
                  userRole = userProfile.role;
                }
              } catch (fsError) {
                console.error("onAuthStateChanged: Error fetching user profile:", fsError);
              }
            }
            
            const finalRole = userRole || 'user';
            setRole(finalRole);
            const targetPath = finalRole === 'admin' || finalRole === 'super_admin' ? '/admin/overview' : '/dashboard';
            
            console.log('onAuthStateChanged: Redirecting after Google login to:', targetPath, { uid: currentUser.uid, role: finalRole });
            
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('auth_redirect_url');
              router.push(targetPath);
              
              // Multiple fallback redirects
              const redirectAttempts = [500, 1000, 2000, 3000, 4000];
              redirectAttempts.forEach((delay) => {
                setTimeout(() => {
                  const stillOnPublicPage = window.location.pathname === '/' || 
                                           window.location.pathname === '/login' ||
                                           window.location.pathname === '/login/' ||
                                           window.location.pathname === '/register';
                  if (stillOnPublicPage) {
                    console.log(`onAuthStateChanged: Router.push failed, forcing redirect after ${delay}ms to`, targetPath);
                    window.location.href = targetPath;
                  }
                }, delay);
              });
            }
          } catch (roleError) {
            console.error('onAuthStateChanged: Error getting user role:', roleError);
            setRole('user');
            if (typeof window !== 'undefined') {
              router.push('/dashboard');
            }
          }
        }
      }
      
      // Don't set loading true here if we want seamless auth state restore
      if (currentUser) {
        setUser(currentUser);
        
        // Only process role and redirect if not already handled by redirect logic above
        if (!redirectHandled) {
          try {
            const tokenResult = await getIdTokenResult(currentUser);
            // Try to get role from claims first
            let userRole = (tokenResult.claims.role as string);

            // If no custom claim, check Firestore
            if (!userRole || userRole === 'user') {
              try {
                 const userProfile = await getUserProfile(currentUser.uid);
                 if (userProfile && userProfile.role) {
                   userRole = userProfile.role;
                 }
              } catch (fsError) {
                console.error("Error fetching user profile from Firestore:", fsError);
              }
            }
            
            const finalRole = userRole || 'user';
            setRole(finalRole);
            
            console.log('onAuthStateChanged: User role determined', { uid: currentUser.uid, role: finalRole });
            
            // Redirect authenticated users away from public pages
            if (typeof window !== 'undefined') {
              const currentPath = window.location.pathname;
              const publicPages = ['/login', '/login/', '/register', '/', '/privacy', '/terms'];
              const isPublicPage = publicPages.includes(currentPath);
              
              // If user is authenticated and on a public page (except legal pages), redirect
              if (isPublicPage && currentPath !== '/privacy' && currentPath !== '/terms') {
                const targetPath = finalRole === 'admin' || finalRole === 'super_admin' ? '/admin/overview' : '/dashboard';
                
                console.log('onAuthStateChanged: User authenticated on public page - redirecting from', currentPath, 'to', targetPath, { role: finalRole });
                
                // Wait a bit to ensure auth state is fully set
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Immediate redirect
                router.push(targetPath);
                
                // Force redirect if router.push doesn't work (multiple attempts)
                const redirectAttempts = [500, 1000, 2000, 3000];
                redirectAttempts.forEach((delay) => {
                  setTimeout(() => {
                    const stillOnPublicPage = window.location.pathname === currentPath || 
                                             window.location.pathname === '/' || 
                                             window.location.pathname === '/login' ||
                                             window.location.pathname === '/login/';
                    if (stillOnPublicPage) {
                      console.log(`onAuthStateChanged: Router.push failed, forcing redirect after ${delay}ms to`, targetPath);
                      window.location.href = targetPath;
                    }
                  }, delay);
                });
              }
            }
          } catch (error) {
            console.error("Error fetching user role:", error);
            setRole('user');
          }
        }
      } else {
        console.log('onAuthStateChanged: No user, clearing auth state');
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    
    // Now check for Google redirect result (this may not return if already processed)
    checkRedirectResult().then(() => {
      console.log('checkRedirectResult completed');
    }).catch((error) => {
      console.error('checkRedirectResult error:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (data: LoginData) => {
    try {
      const credential = await loginWithEmail(data.email, data.password);
      
      // Wait a bit for auth state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get role to determine redirect path
      let userRole = 'user';
      if (credential?.user) {
        try {
          const tokenResult = await getIdTokenResult(credential.user);
          userRole = (tokenResult.claims.role as string) || 'user';
          
          // Check Firestore if no custom claim
          if (!userRole || userRole === 'user') {
            try {
              const userProfile = await getUserProfile(credential.user.uid);
              if (userProfile && userProfile.role) {
                userRole = userProfile.role;
              }
            } catch (fsError) {
              console.error("Error fetching user profile:", fsError);
            }
          }
        } catch (roleError) {
          console.error('Error getting user role:', roleError);
        }
      }
      
      const targetPath = userRole === 'admin' || userRole === 'super_admin' ? '/admin/overview' : '/dashboard';
      console.log('handleLogin: Login successful, redirecting to:', targetPath, { userRole });
      
      // Immediate redirect
      router.push(targetPath);
      
      // Force redirect if router.push doesn't work (multiple attempts)
      const redirectAttempts = [300, 800, 1500];
      redirectAttempts.forEach((delay) => {
        setTimeout(() => {
          if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/')) {
            console.log(`handleLogin: Router.push failed, forcing redirect after ${delay}ms`);
            window.location.href = targetPath;
          }
        }, delay);
      });
    } catch (error: any) {
      // Extract meaningful error message
      let errorMessage = 'Erro ao fazer login';
      
      if (error?.userMessage) {
        // AuthenticationError from firebase-errors
        errorMessage = error.userMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.error('Login failed:', error);
      throw new Error(errorMessage);
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      // loginWithGoogle now uses redirect, so it doesn't return a credential
      // The redirect will happen and handleGoogleRedirect() will process the result
      await loginWithGoogle();
      // Note: The user will be redirected to Google, then back to our app
      // The redirect result will be handled in the useEffect above
    } catch (error: any) {
      // Extract meaningful error message
      let errorMessage = 'Erro ao fazer login com Google';
      
      if (error?.userMessage) {
        errorMessage = error.userMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      console.error('Google login failed:', error);
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
