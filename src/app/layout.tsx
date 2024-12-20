import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Training Solutions",
  description: "Curriculum Module for training solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <QueryProvider>
          <Toaster richColors position="top-center" />
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="beforeInteractive"
          />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
