/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // your experimental features if any
  },
  serverRuntimeConfig: {
    cookieDomain: process.env.NODE_ENV === 'production' 
      ? '.your-domain.com'  // Update with your domain
      : undefined
  }
}

module.exports = nextConfig 