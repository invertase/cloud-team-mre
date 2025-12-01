#!/bin/bash

# Verify if the default compute service account has the required role
# for Cloud Build to access Artifact Registry.
#
# Usage: ./verify-bug.sh <PROJECT_ID>
#
# This script checks if the default compute service account has the
# roles/cloudbuild.builds.builder role, which is required for deploying
# Gen 2 Cloud Functions.

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <PROJECT_ID>"
  echo "Example: $0 my-firebase-project"
  exit 1
fi

PROJECT_ID="$1"

echo "Fetching project number for project: $PROJECT_ID"
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")

if [ -z "$PROJECT_NUMBER" ]; then
  echo "Error: Could not fetch project number. Make sure you're authenticated and the project exists."
  exit 1
fi

SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo ""
echo "Project ID: $PROJECT_ID"
echo "Project Number: $PROJECT_NUMBER"
echo "Default Compute Service Account: $SERVICE_ACCOUNT"
echo ""

echo "Checking if service account has roles/cloudbuild.builds.builder..."
echo ""

ROLE_BINDING=$(gcloud projects get-iam-policy "$PROJECT_ID" \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:$SERVICE_ACCOUNT AND bindings.role:roles/cloudbuild.builds.builder" \
  --format="value(bindings.role)" 2>/dev/null || true)

if [ -n "$ROLE_BINDING" ]; then
  echo "✅ The service account HAS the required role: roles/cloudbuild.builds.builder"
  echo ""
  echo "The deployment should work correctly."
else
  echo "❌ The service account is MISSING the required role: roles/cloudbuild.builds.builder"
  echo ""
  echo "This will cause the following error during deployment:"
  echo "  Permission \"artifactregistry.repositories.downloadArtifacts\" denied on resource"
  echo "  \"projects/$PROJECT_ID/locations/us-central1/repositories/gcf-artifacts\""
  echo ""
  echo "To fix this, run:"
  echo "  ./scripts/fix-permissions.sh $PROJECT_ID"
  echo ""
  echo "Or manually:"
  echo "  gcloud projects add-iam-policy-binding $PROJECT_ID \\"
  echo "    --member=serviceAccount:$SERVICE_ACCOUNT \\"
  echo "    --role=roles/cloudbuild.builds.builder"
fi
