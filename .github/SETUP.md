# GitHub Actions Setup Guide

This guide will help you set up automated CI/CD deployment to Google Cloud Run using GitHub Actions.

## Prerequisites

- GitHub repository with the code
- Google Cloud Project (`nprocess`)
- Billing enabled on GCP
- Required APIs enabled

## Step 1: Create Service Account

Create a service account for GitHub Actions to use:

```bash
# Set your project ID
export PROJECT_ID=nprocess

# Create service account
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions Deploy" \
    --project=$PROJECT_ID

# Get the service account email
export SA_EMAIL=github-actions@${PROJECT_ID}.iam.gserviceaccount.com

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/artifactregistry.admin"
```

## Step 2: Create Service Account Key

```bash
# Create and download the key
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=$SA_EMAIL

# The key will be saved to github-actions-key.json
# IMPORTANT: Keep this file secure and never commit it to the repository!
```

## Step 3: Add Secrets to GitHub

1. **Go to your GitHub repository**:
   - Navigate to: `Settings` → `Secrets and variables` → `Actions`

2. **Add the following secrets**:

   ### GCP_CREDENTIALS (Required)
   - Click **"New repository secret"**
   - Name: `GCP_CREDENTIALS`
   - Value: Copy the **entire contents** of `github-actions-key.json`
   - Click **"Add secret"**

   ### NEXTAUTH_SECRET (Required for production)
   - Click **"New repository secret"**
   - Name: `NEXTAUTH_SECRET`
   - Value: Generate a secure random string:
     ```bash
     openssl rand -base64 32
     ```
   - Click **"Add secret"**

   ### GOOGLE_CLIENT_ID (Optional - for Google OAuth)
   - Name: `GOOGLE_CLIENT_ID`
   - Value: Your Google OAuth Client ID

   ### GOOGLE_CLIENT_SECRET (Optional - for Google OAuth)
   - Name: `GOOGLE_CLIENT_SECRET`
   - Value: Your Google OAuth Client Secret

## Step 4: Verify Workflow File

The workflow file is located at `.github/workflows/deploy.yml`.

It will:
- ✅ Deploy ComplianceEngine API
- ✅ Deploy RegulatoryRAG API
- ✅ Deploy Admin Dashboard
- ✅ Configure environment variables automatically
- ✅ Post deployment summary as comment

## Step 5: Enable GitHub Actions

1. Go to your repository on GitHub
2. Click on the **"Actions"** tab
3. If prompted, click **"I understand my workflows, go ahead and enable them"**

## Step 6: Trigger Deployment

### Automatic Deployment (on push):
```bash
# Make any change and push to main or the feature branch
git add .
git commit -m "Trigger deployment"
git push origin claude/create-compliance-engine-api-WDUVn
```

### Manual Deployment:
1. Go to **Actions** tab in GitHub
2. Select **"Deploy to Cloud Run"** workflow
3. Click **"Run workflow"**
4. Select the branch
5. Click **"Run workflow"** button

## Step 7: Monitor Deployment

1. Go to the **Actions** tab
2. Click on the running workflow
3. Watch the deployment progress in real-time
4. Each job shows detailed logs

Expected duration: **5-10 minutes per service**

## Step 8: Access Deployed Services

After deployment completes, you'll see the URLs in:
- Workflow summary
- Commit comment
- Job logs

Example URLs:
```
ComplianceEngine API: https://compliance-engine-api-xxx-uc.a.run.app
RegulatoryRAG API: https://regulatory-rag-api-xxx-uc.a.run.app
Admin Dashboard: https://compliance-admin-dashboard-xxx-uc.a.run.app
```

## Workflow Triggers

The workflow runs on:
- **Push to `main` branch**: Deploys to production
- **Push to `claude/create-compliance-engine-api-WDUVn`**: Deploys to staging
- **Manual trigger**: Use "Run workflow" button

## Workflow Jobs

### 1. deploy-compliance-api
- Builds and deploys ComplianceEngine API
- Sets up Firestore and Vertex AI configuration
- Returns service URL for dashboard

### 2. deploy-rag-api
- Builds and deploys RegulatoryRAG API
- Configures Vertex AI Search integration
- Enables caching

### 3. deploy-dashboard
- Waits for APIs to deploy first
- Builds and deploys Next.js dashboard
- Automatically configures API URLs
- Sets up NextAuth

### 4. deployment-summary
- Prints all service URLs
- Creates commit comment with deployment info
- Runs even if some jobs fail

## Customization

### Environment Variables

Edit `.github/workflows/deploy.yml` to change:
- `PROJECT_ID`: Your GCP project
- `REGION`: Deployment region (default: `us-central1`)
- Memory/CPU allocations
- Min/max instances
- Timeout values

### Resource Limits

Current settings:

**ComplianceEngine API:**
- Memory: 1Gi
- CPU: 1
- Timeout: 300s
- Concurrency: 80
- Min instances: 0
- Max instances: 10

**RegulatoryRAG API:**
- Memory: 1Gi
- CPU: 1
- Timeout: 300s
- Concurrency: 80
- Min instances: 0
- Max instances: 10

**Admin Dashboard:**
- Memory: 512Mi
- CPU: 1
- Timeout: 60s
- Concurrency: 80
- Min instances: 0
- Max instances: 5

## Troubleshooting

### Issue: "Permission denied" error

**Solution**: Verify service account has correct roles:
```bash
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:github-actions@*"
```

### Issue: "Service account does not exist"

**Solution**: Recreate the service account:
```bash
gcloud iam service-accounts create github-actions \
    --project=$PROJECT_ID
```

### Issue: Deployment fails with "timeout"

**Solution**: Increase timeout in workflow file:
```yaml
--timeout 600  # Increase to 10 minutes
```

### Issue: "GCP_CREDENTIALS secret not found"

**Solution**:
1. Verify secret is added in GitHub Settings → Secrets
2. Check secret name is exactly `GCP_CREDENTIALS`
3. Ensure JSON is valid (copy entire file contents)

## Security Best Practices

1. **Never commit service account keys**:
   - Add `*.json` to `.gitignore`
   - Keep keys in GitHub Secrets only

2. **Rotate keys regularly**:
   ```bash
   # Delete old key
   gcloud iam service-accounts keys delete KEY_ID \
       --iam-account=$SA_EMAIL

   # Create new key
   gcloud iam service-accounts keys create new-key.json \
       --iam-account=$SA_EMAIL
   ```

3. **Use principle of least privilege**:
   - Only grant necessary roles
   - Consider separate service accounts per service

4. **Enable Cloud Audit Logs**:
   - Monitor deployment activities
   - Track who deployed what and when

## Cost Optimization

### Reduce costs by:

1. **Setting appropriate instance limits**:
   ```yaml
   --min-instances 0      # Scale to zero when idle
   --max-instances 5      # Prevent runaway scaling
   ```

2. **Using smaller memory allocations**:
   ```yaml
   --memory 256Mi         # Start small, increase if needed
   ```

3. **Implementing caching**:
   - Already enabled in RegulatoryRAG API
   - Reduces Vertex AI API calls

4. **Monitoring usage**:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision" \
       --limit 100 --format json
   ```

## Monitoring Deployments

### View deployment history:
```bash
# List recent Cloud Run revisions
gcloud run revisions list \
    --service=compliance-engine-api \
    --region=us-central1
```

### View logs:
```bash
# Real-time logs
gcloud run services logs tail compliance-engine-api \
    --region=us-central1
```

### Check service status:
```bash
# Get service details
gcloud run services describe compliance-engine-api \
    --region=us-central1
```

## Rollback

If a deployment fails or causes issues:

### Option 1: Via GitHub Actions
1. Revert the commit that caused the issue
2. Push the revert
3. Workflow will automatically redeploy the previous version

### Option 2: Via gcloud CLI
```bash
# List revisions
gcloud run revisions list --service=compliance-engine-api --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic compliance-engine-api \
    --to-revisions=PREVIOUS_REVISION=100 \
    --region=us-central1
```

## Advanced Configuration

### Deploy to multiple environments:

Create separate workflows for staging and production:

**`.github/workflows/deploy-staging.yml`**:
```yaml
on:
  push:
    branches: [develop]
env:
  PROJECT_ID: nprocess-staging
```

**`.github/workflows/deploy-production.yml`**:
```yaml
on:
  push:
    branches: [main]
env:
  PROJECT_ID: nprocess-production
```

### Add deployment protection:

1. Go to **Settings** → **Environments**
2. Create environment: `production`
3. Add protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches

## Next Steps

1. ✅ Set up GitHub secrets
2. ✅ Push code to trigger deployment
3. ✅ Monitor deployment in Actions tab
4. ✅ Test deployed services
5. ✅ Set up custom domains (optional)
6. ✅ Configure monitoring and alerts
7. ✅ Set up Vertex AI Search data store
8. ✅ Configure Redis/Cloud Memorystore (optional)

## Support

For issues:
- Check workflow logs in Actions tab
- Review GCP Cloud Run logs
- Verify secrets are correctly configured
- Ensure service account has necessary permissions

---

**Congratulations!** Your CI/CD pipeline is now set up. Every push will automatically deploy to Cloud Run! 🚀
