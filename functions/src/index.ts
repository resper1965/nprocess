/**
 * Firebase Functions for nProcess
 *
 * This file exports all Cloud Functions for the nProcess platform
 */

// Initialize Firebase Admin SDK
import './admin';

// Webhook delivery
export { deliverWebhook } from './webhooks/deliver';

// Scheduled tasks
export { dailyCrawler } from './scheduled/crawler';

// Firestore triggers
export { onProcessCreated } from './triggers/process-created';
export { onAnalysisCompleted } from './triggers/analysis-completed';
export { syncUserRoleToClaims } from './triggers/user-role-updated';

// Storage triggers
export { onEvidenceUpload } from './triggers/ingestion';

// Notifications
export { sendComplianceNotification } from './notifications/send';

// Admin utilities
export { syncAllUserClaims } from './triggers/user-role-updated';
