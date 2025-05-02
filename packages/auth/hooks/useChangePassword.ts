"use client"

import { useState } from 'react';
import { toast } from 'sonner';
import { getCookie } from '../utils/cookies';
interface ChangePasswordCredentials {
  oldPassword: string;
  newPassword: string;
}

interface ChangePasswordResult {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
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
      
      // console.log('Change password response:', {
      //   status: response.status,
      //   statusText: response.statusText,
      //   data,
      //   headers: Object.fromEntries([...response.headers.entries()]),
      // });
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to change password');
      }
      
      toast.success('Password changed successfully');
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
      // console.error('Password change error:', err);
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