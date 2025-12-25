/** @type {import('next').NextConfig} */
const nextConfig = {
  // Firebase Hosting requires static export
  output: 'export',
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  // Disable image optimization (Firebase Hosting doesn't support Next.js Image Optimization)
  images: {
    unoptimized: true
  },
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
