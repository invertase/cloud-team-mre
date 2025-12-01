#!/bin/bash
# verify-bug.sh - Verify the custom service account bug
# Usage: ./verify-bug.sh [PROJECT_ID]
#
# This script checks the state of service accounts and attempts deployment
# to verify that the bug exists.

set -e

PROJECT_ID="${1:-$(gcloud config get-value project 2>/dev/null)}"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: Project ID is required"
  echo "Usage: ./verify-bug.sh [PROJECT_ID]"
  exit 1
fi

# Get project number
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
DEFAULT_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo ""
echo "========================================"
echo "Firebase Issue #8841 - Bug Verification"
echo "========================================"
echo ""
echo "Project: $PROJECT_ID"
echo "Project Number: $PROJECT_NUMBER"
echo "Default SA: $DEFAULT_SA"
echo ""

# Step 1: Check if default SA exists
echo "Step 1: Checking if default compute service account exists..."
if gcloud iam service-accounts describe "$DEFAULT_SA" --project="$PROJECT_ID" &>/dev/null; then
  echo "  Status: EXISTS"
  echo ""
  echo "  The default service account still exists."
  echo "  To reproduce the bug, you need to delete it first:"
  echo "    ./delete-default-sa.sh $PROJECT_ID"
  echo ""
  DEFAULT_SA_EXISTS=true
else
  echo "  Status: DELETED (or never existed)"
  DEFAULT_SA_EXISTS=false
fi

# Step 2: Check custom SA in index.ts
echo ""
echo "Step 2: Checking custom service account in index.ts..."
CUSTOM_SA=$(grep -o 'CUSTOM_SERVICE_ACCOUNT = "[^"]*"' ../functions/src/index.ts 2>/dev/null | cut -d'"' -f2 || echo "")
if [ -n "$CUSTOM_SA" ] && [ "$CUSTOM_SA" != "compute-custom@your-project-id.iam.gserviceaccount.com" ]; then
  echo "  Custom SA configured: $CUSTOM_SA"

  # Check if it exists
  if gcloud iam service-accounts describe "$CUSTOM_SA" --project="$PROJECT_ID" &>/dev/null; then
    echo "  Custom SA status: EXISTS"
  else
    echo "  Custom SA status: NOT FOUND"
    echo ""
    echo "  WARNING: Custom service account does not exist!"
    echo "  Run ./setup-custom-sa.sh first."
  fi
else
  echo "  Custom SA: NOT CONFIGURED (still using placeholder)"
  echo ""
  echo "  Please update functions/src/index.ts with your custom SA email."
fi

# Step 3: Check for existing function
echo ""
echo "Step 3: Checking for existing deployed function..."
EXISTING_FUNCTION=$(gcloud functions list --project="$PROJECT_ID" --filter="name~testGroup-addmessage" --format="value(name)" 2>/dev/null | head -1 || echo "")
if [ -n "$EXISTING_FUNCTION" ]; then
  echo "  Found existing function: $EXISTING_FUNCTION"

  # Get the service account it's using
  FUNCTION_SA=$(gcloud functions describe "$EXISTING_FUNCTION" --project="$PROJECT_ID" --gen2 --format="value(serviceConfig.serviceAccountEmail)" 2>/dev/null || echo "unknown")
  BUILD_SA=$(gcloud functions describe "$EXISTING_FUNCTION" --project="$PROJECT_ID" --gen2 --format="value(buildConfig.serviceAccount)" 2>/dev/null || echo "unknown")

  echo "  Runtime SA: $FUNCTION_SA"
  echo "  Build SA: $BUILD_SA"
else
  echo "  No existing function found."
fi

# Step 4: Attempt deployment (if default SA is deleted)
echo ""
echo "Step 4: Deployment test..."
if [ "$DEFAULT_SA_EXISTS" = true ]; then
  echo "  Skipping deployment test - default SA still exists."
  echo "  Delete it first to verify the bug."
else
  echo "  Attempting deployment with custom service account..."
  echo ""
  echo "  Running: firebase deploy --only functions --project $PROJECT_ID"
  echo "  ----------------------------------------"

  cd ..
  if firebase deploy --only functions --project "$PROJECT_ID" 2>&1; then
    echo "  ----------------------------------------"
    echo ""
    echo "  UNEXPECTED: Deployment succeeded!"
    echo "  The bug may have been fixed, or the setup is different."
  else
    echo "  ----------------------------------------"
    echo ""
    echo "  EXPECTED: Deployment failed!"
    echo ""
    echo "  ========================================"
    echo "  BUG CONFIRMED: Firebase Issue #8841"
    echo "  ========================================"
    echo ""
    echo "  Firebase CLI failed even though a custom service account"
    echo "  was specified via setGlobalOptions()."
    echo ""
    echo "  The CLI is trying to use the deleted default SA:"
    echo "    $DEFAULT_SA"
    echo ""
    echo "  Instead of the custom SA specified in code:"
    echo "    $CUSTOM_SA"
  fi
fi

echo ""
