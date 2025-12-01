#!/bin/bash
# setup-custom-sa.sh - Create a custom service account for testing
# Usage: ./setup-custom-sa.sh [PROJECT_ID] [SA_NAME]
# Example: ./setup-custom-sa.sh my-project compute-custom

set -e

PROJECT_ID="${1:-$(gcloud config get-value project 2>/dev/null)}"
SA_NAME="${2:-compute-custom}"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: Project ID is required"
  echo "Usage: ./setup-custom-sa.sh [PROJECT_ID] [SA_NAME]"
  echo "Or set your default project: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "========================================"
echo "Setting up Custom Service Account"
echo "========================================"
echo "Project: $PROJECT_ID"
echo "Service Account: $SA_EMAIL"
echo ""

# Create the service account
echo "Step 1: Creating service account..."
if gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT_ID" &>/dev/null; then
  echo "  Service account already exists, skipping creation."
else
  gcloud iam service-accounts create "$SA_NAME" \
    --project="$PROJECT_ID" \
    --display-name="Custom Compute Service Account for Firebase Functions"
  echo "  Created service account: $SA_EMAIL"
  echo "  Waiting for service account to propagate..."
  sleep 10
fi

# Grant Editor role (as in original issue)
echo ""
echo "Step 2: Granting Editor role..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/editor" \
  --quiet

# Grant additional roles needed for Cloud Functions
echo ""
echo "Step 3: Granting Cloud Functions-specific roles..."

# Cloud Functions Developer
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/cloudfunctions.developer" \
  --quiet

# Cloud Build Service Account (for building functions)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/cloudbuild.builds.builder" \
  --quiet

# Artifact Registry Writer (for storing container images)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/artifactregistry.writer" \
  --quiet

# Storage Object Admin (for uploading function source)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.objectAdmin" \
  --quiet

# Service Account User (to act as itself)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/iam.serviceAccountUser" \
  --quiet

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Service Account Email: $SA_EMAIL"
echo ""
echo "Next steps:"
echo "1. Update functions/src/index.ts with this service account:"
echo "   const CUSTOM_SERVICE_ACCOUNT = \"$SA_EMAIL\";"
echo ""
echo "2. If you need to authenticate as this SA locally:"
echo "   gcloud iam service-accounts keys create key.json --iam-account=$SA_EMAIL"
echo "   export GOOGLE_APPLICATION_CREDENTIALS=\"\$(pwd)/key.json\""
echo ""
