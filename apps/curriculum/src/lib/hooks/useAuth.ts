import { useCallback, useEffect, useState } from 'react';
import { getAuthToken } from '../utils/auth';
import { decodeJWT } from '../utils';

interface User {
  id: string;
  role: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  const loadUser = useCallback(() => {
    const token = getAuthToken();
    
    if (!token) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      });
      return;
    }

    try {
      const decoded = decodeJWT(token);
      
      if (!decoded) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
        return;
      }

      setState({
        user: {
          id: decoded.sub || '',
          role: decoded.role || '',
          email: decoded.email || ''
        },
        isLoading: false,
        isAuthenticated: true
      });
    } catch (error) {
      console.log('Failed to decode token:', error);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    ...state,
    refreshUser: loadUser
  };
};