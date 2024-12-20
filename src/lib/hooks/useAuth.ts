import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth';
import { LoginCredentials } from '@/types/auth';

export function useAuth() {
  const login = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
  });

  const googleLogin = useMutation({
    mutationFn: (token: string) => authService.googleLogin(token),
  });

  const logout = useMutation({
    mutationFn: () => authService.logout(),
  });

  return {
    login,
    googleLogin,
    logout,
  };
}