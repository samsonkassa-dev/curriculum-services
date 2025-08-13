"use client"

import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { LoginCredentials, LoginResponse, ApiError } from '../types/auth';

export function useLogin() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);

  const loginWithCredentials = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      if (data.isFirstTimeLogin) {
        setIsFirstTimeLogin(true);
        return { success: true, isFirstTimeLogin: true };
      }

      // Set the token in the auth context
      login(data.token);

      return { success: true };
    } catch (err) {
      const errorMessage = (err as ApiError).response?.data?.error || 
                          (err instanceof Error ? err.message : 'Login failed');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (token: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Google login failed');
      }
      
      login(data.token);

      return { success: true };
    } catch (err) {
      const errorMessage = (err as ApiError).response?.data?.error || 
                          (err instanceof Error ? err.message : 'Google login failed');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetFirstTimeLogin = () => {
    setIsFirstTimeLogin(false);
  };

  return {
    loginWithCredentials,
    loginWithGoogle,
    isLoading,
    error,
    isFirstTimeLogin,
    resetFirstTimeLogin
  };
} 