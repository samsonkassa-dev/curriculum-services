'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';
import { decodeJWT, isTokenExpired } from '../utils/jwt';

interface User {
  id: string;
  email: string;
  role: string;
  isProfileFilled?: boolean;
  companyProfileId?: string;
  profileStatus?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  googleLogin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  googleLogin: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded && !isTokenExpired(decoded)) {
        setUser({
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role,
          isProfileFilled: decoded.isProfileFilled,
          companyProfileId: decoded.companyProfileId,
          profileStatus: decoded.profileStatus,
        });
      } else {
        deleteCookie('token');
        deleteCookie('company_info');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    setCookie('token', token, 7); // Store token for 7 days
    const decoded = decodeJWT(token);
    if (decoded) {
      setUser({
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        isProfileFilled: decoded.isProfileFilled,
        companyProfileId: decoded.companyProfileId,
        profileStatus: decoded.profileStatus,
      });
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      deleteCookie('token');
      deleteCookie('company_info');
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const googleLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/api/auth/google';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}