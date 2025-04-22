'use client';

import { useAuth } from '@curriculum-services/auth';
import { createContext, useContext, useEffect } from 'react';

// Create a context for auth state
export const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

// Export a hook to use the auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use the hook from our package
  const auth = useAuth();
  
  // Add debugging for auth state changes
  useEffect(() => {
    if (auth.user) {
      console.log('Auth provider: User authenticated with role:', auth.user.role);
    } else if (!auth.isLoading) {
      console.log('Auth provider: No authenticated user');
    }
  }, [auth.user, auth.isLoading]);
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
} 