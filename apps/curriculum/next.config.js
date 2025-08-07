/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  output: 'standalone',
  // Ignore ESLint errors during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable monorepo support
  transpilePackages: [
    '@curriculum-services/auth',
    '@curriculum-services/roles',
    '@curriculum-services/training-components',
    '@curriculum-services/ui'
  ],
  images: {
    domains: ['143.198.54.56', '164.90.209.220']
  },
  // Configure public directory
  webpack: (config) => {
    config.resolve.alias.public = join(__dirname, '../../public');
    return config;
  },
  // any other Next.js config options you need
}

export default nextConfig; 