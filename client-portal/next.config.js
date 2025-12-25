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
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://compliance-engine-5wqihg7s7a-uc.a.run.app',
    NEXT_PUBLIC_RAG_API_URL: process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nprocess',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    NEXT_PUBLIC_FCM_VAPID_KEY: process.env.NEXT_PUBLIC_FCM_VAPID_KEY || '',
  },
}

module.exports = nextConfig
