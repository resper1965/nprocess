# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the ComplianceEngine Platform.

## 📋 Workflows

### 1. Deploy to Cloud Run (`deploy.yml`)

**Triggers:**
- Push to `main` branch (production)
- Push to `claude/create-compliance-engine-api-WDUVn` branch (staging)
- Manual trigger via GitHub UI

**What it does:**
- ✅ Deploys ComplianceEngine API to Cloud Run
- ✅ Deploys RegulatoryRAG API to Cloud Run
- ✅ Deploys Admin Dashboard to Cloud Run
- ✅ Configures environment variables automatically
- ✅ Posts deployment summary as commit comment
- ✅ Provides service URLs in workflow output

**Duration:** ~15-20 minutes (all services)

### 2. Test & Validate (`test.yml`)

**Triggers:**
- Pull requests to `main`
- Push to any branch

**What it does:**
- ✅ Runs Python tests for both APIs
- ✅ Runs linting (Black, Flake8, ESLint)
- ✅ Runs type checking (MyPy, TypeScript)
- ✅ Builds Next.js dashboard
- ✅ Validates all Docker builds
- ✅ Runs security scanning with Trivy

**Duration:** ~8-12 minutes

## 🚀 Quick Start

### First Time Setup

1. **Follow the setup guide**: See [SETUP.md](./SETUP.md)

2. **Add required secrets** in GitHub Settings → Secrets:
   - `GCP_CREDENTIALS` - Service account JSON key
   - `NEXTAUTH_SECRET` - NextAuth secret

3. **Enable workflows** in the Actions tab

4. **Push code** to trigger deployment:
   ```bash
   git push origin claude/create-compliance-engine-api-WDUVn
   ```

### Manual Deployment

1. Go to **Actions** tab
2. Select **"Deploy to Cloud Run"**
3. Click **"Run workflow"**
4. Select branch
5. Click **"Run workflow"** button

## 📊 Workflow Status Badges

Add these to your main README.md:

```markdown
![Deploy](https://github.com/YOUR_USERNAME/nprocess/actions/workflows/deploy.yml/badge.svg)
![Tests](https://github.com/YOUR_USERNAME/nprocess/actions/workflows/test.yml/badge.svg)
```

## 🔧 Customization

### Change deployment region:

Edit `.github/workflows/deploy.yml`:
```yaml
env:
  REGION: us-east1  # Change to your preferred region
```

### Adjust resource limits:

```yaml
--memory 2Gi      # Increase memory
--cpu 2           # Increase CPU
--max-instances 20  # Allow more instances
```

### Add deployment environments:

Create separate workflows for different environments:
- `deploy-staging.yml` - Deploys to staging
- `deploy-production.yml` - Deploys to production

## 📈 Monitoring

### View workflow runs:
- Go to **Actions** tab in GitHub
- Click on any workflow run to see details
- Expand jobs to see step-by-step logs

### Check deployment status:
```bash
gcloud run services list --region=us-central1
```

### View service logs:
```bash
gcloud run services logs tail SERVICE_NAME --region=us-central1
```

## 🐛 Troubleshooting

### Deployment fails with "permission denied"
- Check service account permissions
- Verify `GCP_CREDENTIALS` secret is correct
- See [SETUP.md](./SETUP.md) for role requirements

### Tests fail
- Check linting errors in workflow logs
- Run tests locally: `pytest tests/`
- Fix issues and push again

### Docker build fails
- Verify Dockerfile syntax
- Check dependencies in requirements.txt
- Test build locally: `docker build -t test .`

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Setup Guide](./SETUP.md) - Complete setup instructions

## 🔒 Security

- ✅ Service account keys stored as GitHub Secrets
- ✅ Never commit credentials to repository
- ✅ Rotate keys regularly (every 90 days)
- ✅ Use principle of least privilege for IAM roles
- ✅ Security scanning enabled with Trivy

## 📞 Support

For issues with workflows:
1. Check workflow logs in Actions tab
2. Review [SETUP.md](./SETUP.md) for configuration
3. Verify all secrets are correctly set
4. Check GCP service account permissions

---

**Happy Deploying!** 🚀
