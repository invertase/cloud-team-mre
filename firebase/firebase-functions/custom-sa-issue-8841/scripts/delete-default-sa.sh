#!/bin/bash
# delete-default-sa.sh - Delete the default compute service account
# Usage: ./delete-default-sa.sh [PROJECT_ID]
#
# WARNING: This is a DESTRUCTIVE operation!
# The default compute service account is used by many GCP services.
# Only use this for testing/reproduction purposes.

set -e

PROJECT_ID="${1:-$(gcloud config get-value project 2>/dev/null)}"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: Project ID is required"
  echo "Usage: ./delete-default-sa.sh [PROJECT_ID]"
  exit 1
fi

# Get project number
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
DEFAULT_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo ""
echo "========================================"
echo "  WARNING: DESTRUCTIVE OPERATION"
echo "========================================"
echo ""
echo "This script will DELETE the default compute service account:"
echo ""
echo "  $DEFAULT_SA"
echo ""
echo "This service account is used by:"
echo "  - Google Compute Engine"
echo "  - Cloud Functions (for building)"
echo "  - Cloud Run"
echo "  - App Engine"
echo "  - And other GCP services"
echo ""
echo "IMPORTANT NOTES:"
echo "  - You can restore it within 30 days using restore-default-sa.sh"
echo "  - After 30 days, it is PERMANENTLY deleted"
echo "  - This may break other services in your project"
echo ""
echo "Project: $PROJECT_ID"
echo "Project Number: $PROJECT_NUMBER"
echo ""
echo "========================================"
echo ""

read -p "Type 'DELETE' to confirm deletion: " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
  echo "Aborted. No changes made."
  exit 1
fi

echo ""
echo "Deleting service account..."
gcloud iam service-accounts delete "$DEFAULT_SA" \
  --project="$PROJECT_ID" \
  --quiet

echo ""
echo "========================================"
echo "  Default Service Account Deleted"
echo "========================================"
echo ""
echo "The default compute service account has been deleted."
echo ""
echo "To restore it (within 30 days), run:"
echo "  ./restore-default-sa.sh $PROJECT_ID"
echo ""
echo "You can now test the bug by running:"
echo "  firebase deploy --only functions"
echo ""
