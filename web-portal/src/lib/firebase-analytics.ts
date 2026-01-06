/**
 * Firebase Analytics helpers
 */
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from './firebase-config';

/**
 * Log a custom event
 */
export const logAnalyticsEvent = (
  eventName: string,
  eventParams?: Record<string, any>
): void => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
};

/**
 * Set user ID for analytics
 */
export const setAnalyticsUserId = (userId: string): void => {
  if (analytics) {
    setUserId(analytics, userId);
  }
};

/**
 * Set user properties
 */
export const setAnalyticsUserProperties = (properties: Record<string, string>): void => {
  if (analytics) {
    setUserProperties(analytics, properties);
  }
};

/**
 * Track page view
 */
export const trackPageView = (pageName: string, pagePath?: string): void => {
  logAnalyticsEvent('page_view', {
    page_name: pageName,
    page_path: pagePath || window.location.pathname,
  });
};

/**
 * Track process creation
 */
export const trackProcessCreated = (processId: string, domain: string): void => {
  logAnalyticsEvent('process_created', {
    process_id: processId,
    domain,
  });
};

/**
 * Track compliance analysis
 */
export const trackComplianceAnalysis = (analysisId: string, score: number, domain: string): void => {
  logAnalyticsEvent('compliance_analysis', {
    analysis_id: analysisId,
    score,
    domain,
  });
};

