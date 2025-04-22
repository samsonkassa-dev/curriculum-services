/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__dirname);

const nextConfig = {
  output: 'standalone',
  // Enable monorepo support
  transpilePackages: [
    '@curriculum-services/auth',
  ],
  images: {
    domains: ['143.198.54.56', '164.90.209.220']
  },
  // Configure public directory
  webpack: (config) => {
    config.resolve.alias.public = join(__dirname, '../../public');
    return config;
  },
  // Add async headers configuration
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? '' // No CSP in development
              : "upgrade-insecure-requests" // Force HTTPS in production
          },
          // Add CORS headers
          {
            key: "Access-Control-Allow-Credentials",
            value: "true"
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*" // In production, replace with your specific domain
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
          }
        ],
      },
    ]
  },
  // Add async rewrites to proxy API requests in development
  async rewrites() {
    return process.env.NODE_ENV === 'development' 
      ? [
          {
            source: '/api/:path*',
            destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          }
        ]
      : [];
  }
}

export default nextConfig; 