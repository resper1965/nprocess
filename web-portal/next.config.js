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
    NEXT_PUBLIC_API_URL: 'https://nprocess-api-prod-43006907338.us-central1.run.app',
    NEXT_PUBLIC_ADMIN_API_URL: 'https://nprocess-admin-api-prod-43006907338.us-central1.run.app',
    NEXT_PUBLIC_RAG_API_URL: process.env.NEXT_PUBLIC_RAG_API_URL || '',
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBmA2rJyawq83redy2d2BGjlgTog1_NXmM',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'nprocess-8e801.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nprocess-8e801',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'nprocess-8e801.firebasestorage.app',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '43006907338',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:43006907338:web:f8666ae921f4a584fff533',
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-34RLW0TPXS',
    NEXT_PUBLIC_FCM_VAPID_KEY: process.env.NEXT_PUBLIC_FCM_VAPID_KEY || '',
    NEXT_PUBLIC_GCP_PROJECT_ID: process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'nprocess-prod',
  },
}
module.exports = nextConfig
