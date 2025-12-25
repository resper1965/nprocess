/**
 * Firebase Functions for nProcess
 * 
 * This file exports all Cloud Functions for the nProcess platform
 */

// Webhook delivery
export { deliverWebhook } from './webhooks/deliver';

// Scheduled tasks
export { dailyCrawler } from './scheduled/crawler';

// Firestore triggers
export { onProcessCreated } from './triggers/process-created';
export { onAnalysisCompleted } from './triggers/analysis-completed';

// Notifications
export { sendComplianceNotification } from './notifications/send';

