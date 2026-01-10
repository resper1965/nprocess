'use client';

/**
 * Authentication Provider
 * 
 * Provides authentication context to the entire application.
 * Handles Firebase auth state, custom claims extraction, and
 * redirects users without org_id to the waiting room.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebase';
import { AuthUser, getCustomClaims, signOut } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/waiting-room'];



interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get auth instance lazily (client-side only)
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setFirebaseUser(firebaseUser);
        
        // Get custom claims
        const claims = await getCustomClaims(firebaseUser);
        
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          claims,
        };
        
        setUser(authUser);
        
        // CRITICAL: Redirect users without org_id to waiting room
        if (!claims.org_id && !PUBLIC_ROUTES.includes(pathname)) {
          console.log('User has no org_id, redirecting to waiting room');
          router.push('/waiting-room');
        }
        
        // Check for pending status
        if (claims.status === 'pending' && !PUBLIC_ROUTES.includes(pathname)) {
          console.log('User status is pending, redirecting to waiting room');
          router.push('/waiting-room');
        }
        
        // Check for admin routes
        if (pathname.startsWith('/admin') && claims.role !== 'super_admin') {
          console.log('User is not super_admin, access denied');
          router.push('/');
        }
      } else {
        // User is signed out
        setFirebaseUser(null);
        setUser(null);
        
        // Redirect to login if not on public route
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.push('/login');
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
