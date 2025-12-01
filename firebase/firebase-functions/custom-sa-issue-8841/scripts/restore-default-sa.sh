#!/bin/bash
# restore-default-sa.sh - Restore the default compute service account
# Usage: ./restore-default-sa.sh [PROJECT_ID]
#
# NOTE: This only works within 30 days of deletion.
# After 30 days, the service account is permanently deleted.

set -e

PROJECT_ID="${1:-$(gcloud config get-value project 2>/dev/null)}"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: Project ID is required"
  echo "Usage: ./restore-default-sa.sh [PROJECT_ID]"
  exit 1
fi

# Get project number
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
DEFAULT_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo ""
echo "========================================"
echo "Restoring Default Compute Service Account"
echo "========================================"
echo ""
echo "Project: $PROJECT_ID"
echo "Project Number: $PROJECT_NUMBER"
echo "Service Account: $DEFAULT_SA"
echo ""

# Check if it already exists
if gcloud iam service-accounts describe "$DEFAULT_SA" --project="$PROJECT_ID" &>/dev/null; then
  echo "Service account already exists. No restoration needed."
  exit 0
fi

# Try to find the unique ID from audit logs automatically
echo "Searching audit logs for the unique ID..."
UNIQUE_ID=$(gcloud logging read "protoPayload.methodName=\"google.iam.admin.v1.DeleteServiceAccount\" AND resource.labels.email_id=\"$DEFAULT_SA\"" \
  --project="$PROJECT_ID" \
  --limit=1 \
  --format='value(resource.labels.unique_id)' 2>/dev/null)

if [ -z "$UNIQUE_ID" ]; then
  echo "Could not find unique ID in audit logs."
  echo ""
  echo "To restore manually, you need the unique ID (21-digit number)."
  echo ""
  echo "To find it:"
  echo "  1. Go to: https://console.cloud.google.com/logs/query?project=$PROJECT_ID"
  echo "  2. Search for: protoPayload.methodName=\"google.iam.admin.v1.DeleteServiceAccount\""
  echo "  3. Find the entry for $DEFAULT_SA"
  echo "  4. Look for resource.labels.unique_id"
  echo ""

  if [ -z "$2" ]; then
    read -p "Enter the unique ID (or press Enter to skip): " UNIQUE_ID
  else
    UNIQUE_ID="$2"
  fi

  if [ -z "$UNIQUE_ID" ]; then
    echo ""
    echo "No unique ID provided. Cannot restore."
    exit 1
  fi
else
  echo "Found unique ID: $UNIQUE_ID"
fi

echo ""
echo "Attempting to restore service account with ID: $UNIQUE_ID"
echo ""

# Try to undelete using unique ID
if gcloud iam service-accounts undelete "$UNIQUE_ID" --project="$PROJECT_ID" 2>&1; then
  echo ""
  echo "========================================"
  echo "  Restoration Successful!"
  echo "========================================"
  echo ""
  echo "The default compute service account has been restored."
  echo ""
  echo "You may need to re-grant some IAM roles that were removed."
  echo "Typically, the default compute SA has these roles:"
  echo "  - roles/editor (on the project)"
  echo ""
else
  echo ""
  echo "========================================"
  echo "  Restoration Failed"
  echo "========================================"
  echo ""
  echo "The service account could not be restored."
  echo ""
  echo "Possible reasons:"
  echo "  1. More than 30 days have passed since deletion"
  echo "  2. The service account was permanently purged"
  echo "  3. Insufficient permissions"
  echo ""
  echo "If the service account cannot be restored, you have these options:"
  echo ""
  echo "  Option 1: Create a new project"
  echo "    - New projects come with a fresh default compute SA"
  echo ""
  echo "  Option 2: Use a custom service account for all functions"
  echo "    - This is what the bug report is about - it doesn't work!"
  echo ""
  echo "  Option 3: Contact GCP Support"
  echo "    - They may be able to help in some cases"
  echo ""
fi
