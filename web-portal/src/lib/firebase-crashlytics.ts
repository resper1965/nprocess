/**
 * Firebase Crashlytics helpers
 * Note: Crashlytics is primarily for native apps, but we can use it for error tracking
 */
import { getAnalytics } from 'firebase/analytics';
import { analytics } from './firebase-config';

/**
 * Log a non-fatal error
 */
export const logError = (error: Error, context?: Record<string, any>): void => {
  if (analytics) {
    // For web, we use Analytics to track errors
    // In a native app, we would use Crashlytics SDK
    const errorParams: Record<string, any> = {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack?.substring(0, 500), // Limit stack trace length
      ...context,
    };
    
    // Log as custom event
    import('./firebase-analytics').then(({ logAnalyticsEvent }) => {
      logAnalyticsEvent('error_occurred', errorParams);
    });
  }
  
  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', error, context);
  }
};

/**
 * Set user identifier for error tracking
 */
export const setCrashlyticsUserId = (userId: string): void => {
  // In native apps, this would set the user ID in Crashlytics
  // For web, we use Analytics
  import('./firebase-analytics').then(({ setAnalyticsUserId }) => {
    setAnalyticsUserId(userId);
  });
};

/**
 * Set custom key-value pairs for error context
 */
export const setCrashlyticsCustomKey = (key: string, value: string): void => {
  // In native apps, this would set custom keys in Crashlytics
  // For web, we use Analytics user properties
  import('./firebase-analytics').then(({ setAnalyticsUserProperties }) => {
    setAnalyticsUserProperties({ [key]: value });
  });
};

