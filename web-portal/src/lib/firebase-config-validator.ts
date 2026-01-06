/**
 * Validates Firebase configuration
 * Ensures all required environment variables are present before initializing Firebase
 */

export interface FirebaseConfigValidation {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateFirebaseConfig(): FirebaseConfigValidation {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  const optionalVars = [
    'NEXT_PUBLIC_FCM_VAPID_KEY',
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    }
  });

  // Check optional variables
  optionalVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      warnings.push(`${varName} is not configured - FCM will not work`);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function logFirebaseConfigStatus(): void {
  const validation = validateFirebaseConfig();

  if (!validation.valid) {
    console.error('❌ Firebase Configuration Error:');
    console.error('   Missing required environment variables:');
    validation.missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error('');
    console.error('   Please set these variables in your .env.local file');
    console.error('   See .env.example for reference');
  } else {
    console.log('✅ Firebase configuration is valid');

    if (validation.warnings.length > 0) {
      console.warn('⚠️  Firebase Configuration Warnings:');
      validation.warnings.forEach((warning) => {
        console.warn(`   - ${warning}`);
      });
    }
  }
}
