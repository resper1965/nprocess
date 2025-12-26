/**
 * Firebase Admin SDK initialization
 * Centralized initialization to avoid multiple instances
 */
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (only once)
if (admin.apps.length === 0) {
  admin.initializeApp();
  console.log('✅ Firebase Admin SDK initialized');
} else {
  console.log('ℹ️  Firebase Admin SDK already initialized');
}

// Export initialized services for use across functions
export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();
export const adminStorage = admin.storage();
export const adminMessaging = admin.messaging();

export default admin;
