import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth';
import { LoginCredentials, LoginResponse } from '@/types/auth';

export function useAuth() {
  const login = useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
  });

  const googleLogin = useMutation<LoginResponse, Error, string>({
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