"use client"

import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from '../providers/auth-provider';
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1
      }
    }
  }));

  return (
    <html lang="en" className={inter.variable}>
      <body className={`antialiased font-sans`}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Script
              src="https://accounts.google.com/gsi/client"
              strategy="beforeInteractive"
            />
            {children}
            <Analytics />
            <Toaster richColors position="top-center" />
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
