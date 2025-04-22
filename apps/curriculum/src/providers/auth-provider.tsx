'use client';

import { AuthProvider as AuthProviderComponent } from '@curriculum-services/auth';
import React from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <AuthProviderComponent>{children}</AuthProviderComponent>;
} 