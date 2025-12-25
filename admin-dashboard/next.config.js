/** @type {import('next').NextConfig} */
const nextConfig = {
  // Admin Dashboard uses Next.js server (deployed to Cloud Run)
  // NOT static export - requires API routes and middleware for NextAuth
  output: 'standalone', // For Docker/Cloud Run deployment
  reactStrictMode: true,
  swcMinify: true,
  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*'],
  },
  env: {
    NEXT_PUBLIC_ADMIN_API_URL: process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:8008',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://compliance-engine-5wqihg7s7a-uc.a.run.app',
  },
};

module.exports = nextConfig;
