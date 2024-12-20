'use client'

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { useAuth } from '@/lib/hooks/useAuth';
import { LoginCredentials, LoginResponse, Session } from '@/types/auth';
import { toast } from 'sonner';
import { ApiError } from '@/types/auth';
import { useRouter } from 'next/navigation';

interface GoogleTokenResponse {
  access_token: string;
}

export default function Login() {
  const router = useRouter();
  const { login, googleLogin } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login.mutateAsync(credentials) as Session;
      toast.success('Successfully logged in');
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error as ApiError;
      toast.error(errorMessage.response?.data?.error || 'Login failed');
    }
  };

  const handleGoogleSignIn = async () => {
    const auth2 = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: 'email profile openid',
      callback: async (response: GoogleTokenResponse) => {
        if (response.access_token) {
          try {
            const result = await googleLogin.mutateAsync(response.access_token) as Session;
            toast.success('Successfully logged in with Google');
          } catch (error: unknown) {
            const errorMessage = error as ApiError;
            toast.error(errorMessage.response?.data?.error || 'Login failed');
          }
        }
      },
    });

    auth2.requestAccessToken();
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full items-center justify-center bg-background p-4 lg:w-1/2">
        <div className="w-full max-w-[368px] space-y-6">
          <div className="space-y-2 text-center">
            <img
              src="/placeholder-logo.svg"
              alt="Logo"
              width={40}
              height={40}
              className="mx-auto"
            />
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="youremail@gmail.com"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold">
                Password
              </label>
              <Input 
                id="password" 
                type="password" 
                placeholder="********" 
                showPasswordToggle
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
              />
            </div>

            {login.error && (
              <div className="text-red-500 text-sm text-center">
                {login.error.message}
              </div>
            )}

            <div className="text-right">
              <a
                href="#"
                className="text-sm font-normal text-brand hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <form onSubmit={handleLogin}>
              <button 
                type="submit" 
                disabled={login.isPending}
                className="w-full rounded-md bg-brand px-4 py-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {login.isPending ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <button 
              onClick={handleGoogleSignIn}
              disabled={googleLogin.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <img
                src="/google.svg"
                alt="Google logo"
                width={16}
                height={16}
              />
              Continue with Google
            </button>
          </div>
        </div>
      </div>

      <div className="hidden w-1/2 bg-brand lg:block" />
    </div>
  );
}
