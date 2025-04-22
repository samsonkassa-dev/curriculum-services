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
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Authorization, Content-Type'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          }
        ]
      }
    ];
  },
  // Add rewrites to proxy API requests through Next.js
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API}/api/:path*`
        },
        // Proxy all API calls through Next.js
        {
          source: '/:path*',
          has: [
            {
              type: 'header',
              key: 'accept',
              value: 'application/json'
            }
          ],
          destination: `${process.env.NEXT_PUBLIC_API}/:path*`
        }
      ]
    };
  }
}

export default nextConfig; 