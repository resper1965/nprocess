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

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Don't set loading true here if we want seamless auth state restore
      if (currentUser) {
        setUser(currentUser);
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
          
          // If we're on login page and user just logged in, redirect to dashboard
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (currentPath === '/login' || currentPath === '/register') {
               const targetPath = finalRole === 'admin' || finalRole === 'super_admin' ? '/admin' : '/dashboard';
              // Use both router.push and window.location for reliability
              router.push(targetPath);
              // Fallback: force navigation if router.push doesn't work
              setTimeout(() => {
                if (window.location.pathname === currentPath) {
                  window.location.href = targetPath;
                }
              }, 100);
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole('user');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (data: LoginData) => {
    try {
      await loginWithEmail(data.email, data.password);
      router.push('/dashboard');
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
      const userCredential = await loginWithGoogle();
      // Immediately redirect after successful login
      if (userCredential?.user) {
        // Force redirect to dashboard
        router.push('/dashboard');
        // Also use window.location as fallback for immediate navigation
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        }
      }
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
