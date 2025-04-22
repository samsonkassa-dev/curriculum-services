/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
          }
        ],
      },
    ]
  },
  // any other Next.js config options you need
}

export default nextConfig; 