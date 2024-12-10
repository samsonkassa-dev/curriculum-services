'use client'

import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { signInWithEmail, googleSignIn } from '@/lib/auth-client';

// Add types for Google OAuth
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface TokenClient {
  requestAccessToken(): void;
}

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
          }): TokenClient;
        };
      };
    };
  }
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
      
      await signInWithEmail(email, password);
      setSuccess('Successfully logged in!');
      setError(''); // Clear any previous errors
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setSuccess(''); // Clear any previous success message
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const auth2 = await window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: 'email profile openid',
        callback: async (response: TokenResponse) => {
          if (response.access_token) {
            try {
              await googleSignIn(response.access_token);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Google sign in failed');
            }
          }
        },
      });

      auth2.requestAccessToken();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed');
    }
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-500 text-sm text-center">
                {success}
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
                className="w-full rounded-md bg-brand px-4 py-4 text-sm font-medium text-white hover:bg-blue-700"
              >
                Log in
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
