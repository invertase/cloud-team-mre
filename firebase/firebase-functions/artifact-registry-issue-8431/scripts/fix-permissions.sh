#!/bin/bash

# Fix the permission issue by adding the required role to the default
# compute service account.
#
# Usage: ./fix-permissions.sh <PROJECT_ID>
#
# This script adds roles/cloudbuild.builds.builder to the default compute
# service account, which is required for deploying Gen 2 Cloud Functions.

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

echo "Adding roles/cloudbuild.builds.builder to the service account..."
echo ""

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/cloudbuild.builds.builder" \
  --condition=None

echo ""
echo "✅ Successfully added roles/cloudbuild.builds.builder to $SERVICE_ACCOUNT"
echo ""
echo "You should now be able to deploy Gen 2 Cloud Functions successfully."
echo "Try running: npm run deploy"
