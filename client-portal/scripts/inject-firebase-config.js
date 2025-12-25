#!/usr/bin/env node
/**
 * Inject Firebase configuration into service worker
 * Service workers can't access process.env, so we need to inject variables during build
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');
const SW_TEMPLATE = path.join(PUBLIC_DIR, 'firebase-messaging-sw.template.js');
const SW_OUTPUT = path.join(PUBLIC_DIR, 'firebase-messaging-sw.js');

// Read environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nprocess',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Validate required variables
const missingVars = [];
if (!firebaseConfig.apiKey) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
if (!firebaseConfig.authDomain) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.storageBucket) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
if (!firebaseConfig.messagingSenderId) missingVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
if (!firebaseConfig.appId) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

if (missingVars.length > 0) {
  console.warn('⚠️  Warning: Missing Firebase environment variables:', missingVars.join(', '));
  console.warn('⚠️  Service Worker will use placeholder values. FCM may not work correctly.');
}

// Read template
let template;
try {
  template = fs.readFileSync(SW_TEMPLATE, 'utf8');
} catch (error) {
  console.error('❌ Error: Could not find service worker template at:', SW_TEMPLATE);
  process.exit(1);
}

// Replace placeholders
let output = template
  .replace('{{FIREBASE_API_KEY}}', firebaseConfig.apiKey)
  .replace('{{FIREBASE_AUTH_DOMAIN}}', firebaseConfig.authDomain)
  .replace('{{FIREBASE_PROJECT_ID}}', firebaseConfig.projectId)
  .replace('{{FIREBASE_STORAGE_BUCKET}}', firebaseConfig.storageBucket)
  .replace('{{FIREBASE_MESSAGING_SENDER_ID}}', firebaseConfig.messagingSenderId)
  .replace('{{FIREBASE_APP_ID}}', firebaseConfig.appId);

// Write output
try {
  fs.writeFileSync(SW_OUTPUT, output, 'utf8');
  console.log('✅ Service Worker generated successfully at:', SW_OUTPUT);
  console.log('   Project ID:', firebaseConfig.projectId);
} catch (error) {
  console.error('❌ Error writing service worker:', error.message);
  process.exit(1);
}
