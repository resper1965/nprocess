#!/bin/bash
set -e

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"nprocess-8e801"}
SA_NAME="github-actions-deployer"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
KEY_FILE="gcp-sa-key.json"

echo "Setting up CI/CD Service Account for project: $PROJECT_ID"

# 1. Create Service Account if not exists
if ! gcloud iam service-accounts describe "$SA_EMAIL" --project "$PROJECT_ID" &>/dev/null; then
    echo "Creating Service Account: $SA_NAME..."
    gcloud iam service-accounts create "$SA_NAME" \
        --description="GitHub Actions Deployer" \
        --display-name="GitHub Actions Deployer" \
        --project "$PROJECT_ID"
else
    echo "Service Account $SA_NAME already exists."
fi

# 2. Grant Permissions
echo "Granting IAM roles..."
ROLES=(
    "roles/run.admin"
    "roles/storage.admin"
    "roles/serviceusage.serviceUsageAdmin"
    "roles/iam.serviceAccountUser"
    "roles/firebase.admin"
    "roles/cloudbuild.builds.editor"
    "roles/artifactregistry.admin"
)

for role in "${ROLES[@]}"; do
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$role" \
        --condition=None
done

# 3. Create JSON Key
echo "Generating JSON Key..."
if [ -f "$KEY_FILE" ]; then
    echo "Key file $KEY_FILE already exists. Skipping creation to avoid key rotation."
else
    gcloud iam service-accounts keys create "$KEY_FILE" \
        --iam-account="$SA_EMAIL" \
        --project "$PROJECT_ID"
    echo "Key created: $KEY_FILE"
fi

echo ""
echo "=========================================================="
echo "SUCCESS! Setup Complete."
echo "=========================================================="
echo "1. The JSON key is saved in: $KEY_FILE"
echo "2. Copy the content of this file."
echo "3. Go to GitHub Repo > Settings > Secrets and variables > Actions"
echo "4. Create a New Repository Secret:"
echo "   - Name: GCP_SA_KEY"
echo "   - Value: (Paste the JSON content)"
echo "5. Also create FIREBASE_TOKEN:"
echo "   - Run 'firebase login:ci' locally to generate one."
echo "=========================================================="
