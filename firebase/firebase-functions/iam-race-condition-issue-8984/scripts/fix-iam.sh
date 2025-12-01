#!/bin/bash
# fix-iam.sh - Workaround to manually fix the IAM policy
# Usage: PROJECT_ID=your-project ./fix-iam.sh [FUNCTION_NAME]
# Example: PROJECT_ID=my-project ./fix-iam.sh
# Example: PROJECT_ID=my-project ./fix-iam.sh helloFailingInitialDeploy

set -e

FUNCTION_NAME=${1:-helloFailingInitialDeploy}
REGION=${REGION:-us-central1}

# Use PROJECT_ID env var, or fall back to gcloud default
if [ -z "$PROJECT_ID" ]; then
  PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
fi

if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID not set."
  echo "Usage: PROJECT_ID=your-project ./fix-iam.sh [FUNCTION_NAME]"
  exit 1
fi

SERVICE_NAME=$(echo "$FUNCTION_NAME" | tr '[:upper:]' '[:lower:]')

echo "=========================================="
echo "Fixing IAM Policy for Cloud Run Service"
echo "=========================================="
echo ""
echo "Project: $PROJECT_ID"
echo "Function: $FUNCTION_NAME"
echo "Cloud Run Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

echo "Adding allUsers as run.invoker..."
gcloud run services add-iam-policy-binding "$SERVICE_NAME" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --member="allUsers" \
  --role="roles/run.invoker"

echo ""
echo "=========================================="
echo "IAM Policy Fixed!"
echo "=========================================="
echo ""
echo "The function should now be publicly accessible."
echo ""

# Get and display the function URL
FUNCTION_URL=$(gcloud run services describe "$SERVICE_NAME" --project="$PROJECT_ID" --region="$REGION" --format="value(status.url)" 2>/dev/null)
echo "Test it with:"
echo "  curl $FUNCTION_URL"
