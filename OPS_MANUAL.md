# Operations Manual (OPS_MANUAL)

This document provides step-by-step instructions for maintaining the **n.process** platform in a production environment. It covers FinOps (Cost Control), Observability, Disaster Recovery, and Extensions.

## 1. FinOps & Cost Control

### 1.1. Cloud Run Limits (Implemented)

All services are deployed with a hard limit of **5 concurrent instances** to prevent runaway costs during traffic spikes or DDoS attacks.

- **Verification**: Check `deploy-gcp.sh` or Run:
  ```bash
  gcloud run services describe nprocess-api-prod --region us-central1 --format="value(status.traffic)"
  ```

### 1.2. Setting Up Budget Alerts (Manual Action Required)

Google Cloud does not allow creating Budgets via API/Terraform easily without complex permissions.

1. Go to **[GCP Billing Console](https://console.cloud.google.com/billing)**.
2. Select **Budgets & alerts**.
3. Click **Create Budget**.
4. Set Amount: **$50.00** (or your threshold).
5. Set Thresholds: 50%, 90%, 100%.
6. **Action**: Check "Email alerts to billing admins".

---

## 2. Observability & Monitoring

### 2.1. Uptime Checks (Manual Action Required)

Ensure the black-box availability of the service.

1. Go to **[Cloud Monitoring > Uptime Checks](https://console.cloud.google.com/monitoring/uptime)**.
2. Click **Create Uptime Check**.
3. **Target**:
   - Hostname: `nprocess-api-prod-[hash].us-central1.run.app`
   - Path: `/health`
4. **Frequency**: 5 minutes.
5. **Alerting**: Create an alert policy if the check fails.

### 2.2. Error Reporting

The application automatically reports unhandled exceptions to **Cloud Error Reporting**.

- Check the dashboard weekly for new clusters of errors.

---

## 3. Disaster Recovery (DR)

### 3.1. Firestore Backups (PITR)

To protect against accidental deletion, enable Point-in-Time Recovery (PITR).

1. Open Cloud Shell.
2. Run:
   ```bash
   gcloud firestore databases update --type=firestore-native --enable-pitr
   ```
   _Note: This retains data for 7 days._

### 3.2. Weekly "Cold" Backups

For long-term retention/compliance.

1. Create a Storage Bucket: `gs://nprocess-backups`.
2. Schedule a Cloud Scheduler job to run:
   ```bash
   gcloud firestore export gs://nprocess-backups/$(date +%Y-%m-%d)
   ```

---

## 4. Deployment & Testing

### 4.1. CI/CD Pipeline

- **GitHub Actions**: Defined in `.github/workflows/deploy.yml`.
- **Triggers**: Push to `main`.
- **Steps**:
  1. **Test**: Runs `pytest` (Backend) and `npm run lint` (Frontend).
  2. **Deploy Backend**: Deploys `nprocess-api` and `nprocess-admin-api` to Cloud Run.
  3. **Deploy Frontend**: Deploys `client-portal` to Firebase Hosting.

### 4.2. Rollback

If a bad deploy occurs:

1. **Frontend**:
   ```bash
   firebase hosting:channel:deploy --only client-portal
   # Or usually, just revert git commit and push.
   ```
2. **Backend**:
   ```bash
   gcloud run services update-traffic nprocess-api-prod --to-tags=PREVIOUS_REVISION=100
   ```

---

## 5. Active Firebase Extensions

The following extensions are installed to handle Compliance, FinOps, and AI processing.

### 5.1. Delete User Data (Compliance)

- **ID**: `firebase/delete-user-data`
- **Purpose**: Automatically clears Firestore data when a user is deleted from Auth.
- **Config**: Target `users` collection (Recursive delete).

### 5.2. Auto Stop Services (FinOps - Kill Switch)

- **ID**: `kurtweston/functions-auto-stop-billing`
- **Purpose**: Disables billing/services if budget is exceeded to prevent overdraft.
- **CRITICAL SETUP**:
  1. Go to [GCP Billing Budgets](https://console.cloud.google.com/billing).
  2. Edit your Budget.
  3. Under "Manage notifications", connect to a **Pub/Sub topic** named `billing-alerts` (or similar).
  4. Ensure the Extension is listening to this same topic.
     _Without this Pub/Sub link, the extension will NOT work._

### 5.3. Extract Image Text (AI OCR)

- **ID**: `googlecloud/storage-extract-image-text`
- **Purpose**: Extracts text from images uploaded to Storage (Cloud Vision API).
- **Usage**:
  - User uploads image to configured Storage path.
  - Extension extracts text.
  - Text is written to a Firestore collection (default: `image_text`).
  - **Cost Warning**: Cloud Vision API incurs per-image costs. Provide guidelines to users to avoid bulk uploads.
