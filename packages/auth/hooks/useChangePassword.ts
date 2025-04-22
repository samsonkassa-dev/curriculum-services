"use client"

import { useState } from 'react';
import { toast } from 'sonner';
import { getCookie } from '../utils/cookies';
interface ChangePasswordCredentials {
  oldPassword: string;
  password: string;
}

interface ChangePasswordResult {
  success: boolean;
  error?: string;
}

export function useChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = getCookie('token');

  const changePassword = async (credentials: ChangePasswordCredentials): Promise<ChangePasswordResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      
      toast.success('Password changed successfully');
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
      toast.error('Error', { description: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    changePassword,
    isLoading,
    error
  };
} 