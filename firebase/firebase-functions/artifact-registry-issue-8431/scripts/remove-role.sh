#!/bin/bash

# Remove the required role from the default compute service account
# to reproduce the permission denied error.
#
# Usage: ./remove-role.sh <PROJECT_ID>
#
# WARNING: This will cause Gen 2 Cloud Function deployments to fail!
# Only use this script to reproduce the issue for testing purposes.

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

echo "⚠️  WARNING: This will cause Gen 2 Cloud Function deployments to fail!"
read -p "Are you sure you want to remove the role? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "Removing roles/cloudbuild.builds.builder from the service account..."
echo ""

gcloud projects remove-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/cloudbuild.builds.builder" \
  --condition=None 2>/dev/null || echo "Note: Role may not have been assigned."

echo ""
echo "✅ Successfully removed roles/cloudbuild.builds.builder from $SERVICE_ACCOUNT"
echo ""
echo "You can now reproduce the permission denied error by running:"
echo "  cd functions && npm run deploy"
echo ""
echo "To fix the issue, run:"
echo "  ./scripts/fix-permissions.sh $PROJECT_ID"
