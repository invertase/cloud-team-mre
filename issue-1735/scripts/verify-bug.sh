#!/bin/bash

# Verification script for onSchedule PERMISSION_DENIED bug (#1735)
# This script checks Cloud Scheduler job configuration and IAM permissions
# to identify the missing 'audience' field in OIDC token

set -e

PROJECT_ID="${PROJECT_ID:-}"
FUNCTION_NAME="${FUNCTION_NAME:-testScheduler}"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID environment variable is required"
  echo "Usage: PROJECT_ID=your-project-id [FUNCTION_NAME=testScheduler] ./scripts/verify-bug.sh"
  exit 1
fi

echo "Verifying Cloud Scheduler configuration for project: $PROJECT_ID"
echo "Function name: $FUNCTION_NAME"
echo "=========================================="
echo ""

# Find the scheduler job (it may have a prefix like firebase-schedule-)
JOB_NAME=$(gcloud scheduler jobs list --project="$PROJECT_ID" --format="value(name)" 2>/dev/null | grep -i "$FUNCTION_NAME" | head -1)

if [ -z "$JOB_NAME" ]; then
  echo "❌ No Cloud Scheduler job found for function: $FUNCTION_NAME"
  echo "   Make sure the function has been deployed."
  exit 1
fi

echo "Found job: $JOB_NAME"
echo ""

# Get job details
JOB_DETAILS=$(gcloud scheduler jobs describe "$JOB_NAME" --project="$PROJECT_ID" --format="json" 2>/dev/null)

if [ -z "$JOB_DETAILS" ]; then
  echo "❌ Failed to get job details"
  exit 1
fi

# Extract key information
URI=$(echo "$JOB_DETAILS" | jq -r '.httpTarget.uri // "N/A"')
SERVICE_ACCOUNT=$(echo "$JOB_DETAILS" | jq -r '.httpTarget.oidcToken.serviceAccountEmail // "N/A"')
AUDIENCE=$(echo "$JOB_DETAILS" | jq -r '.httpTarget.oidcToken.audience // "MISSING"')
HTTP_METHOD=$(echo "$JOB_DETAILS" | jq -r '.httpTarget.httpMethod // "N/A"')

echo "Job Configuration:"
echo "  URI: $URI"
echo "  HTTP Method: $HTTP_METHOD"
echo "  Service Account: $SERVICE_ACCOUNT"
echo "  OIDC Token Audience: $AUDIENCE"
echo ""

# Check for the bug
BUG_DETECTED=false

if [ "$AUDIENCE" = "MISSING" ] || [ "$AUDIENCE" = "null" ] || [ -z "$AUDIENCE" ]; then
  echo "❌ BUG DETECTED: OIDC token is missing the 'audience' field!"
  BUG_DETECTED=true
else
  echo "✅ OIDC token has 'audience' field: $AUDIENCE"
  
  # Verify audience matches URI
  if [ "$AUDIENCE" != "$URI" ]; then
    echo "⚠️  WARNING: Audience ($AUDIENCE) does not match URI ($URI)"
  else
    echo "✅ Audience matches URI"
  fi
fi

# Check URL format
if [[ "$URI" == *".run.app"* ]]; then
  echo "✅ URL is in v2 Cloud Run format (.run.app)"
elif [[ "$URI" == *"cloudfunctions.net"* ]]; then
  echo "❌ URL is in v1 format (cloudfunctions.net) - this is a different bug (#1734)"
else
  echo "⚠️  Unknown URL format: $URI"
fi

echo ""
echo "=========================================="
echo ""

# Get Cloud Run service name from URI
if [[ "$URI" =~ https://([^/]+)\.run\.app ]]; then
  SERVICE_NAME="${BASH_REMATCH[1]}"
  # Extract base service name (remove hash suffix)
  BASE_SERVICE_NAME=$(echo "$SERVICE_NAME" | sed 's/-[a-z0-9]\{10\}$//')
  
  echo "Checking IAM permissions for Cloud Run service: $BASE_SERVICE_NAME"
  echo ""
  
  # Try to get IAM policy for the service
  REGION=$(echo "$JOB_NAME" | grep -oP 'locations/\K[^/]+' || echo "us-central1")
  
  IAM_POLICY=$(gcloud run services get-iam-policy "$BASE_SERVICE_NAME" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="json" 2>/dev/null || echo "{}")
  
  if [ "$IAM_POLICY" != "{}" ]; then
    # Check if service account has run.invoker role
    HAS_INVOKER=$(echo "$IAM_POLICY" | jq -r --arg sa "$SERVICE_ACCOUNT" '
      .bindings[]? | 
      select(.role == "roles/run.invoker") | 
      .members[]? | 
      select(. == "serviceAccount:" + $sa)
    ')
    
    if [ -n "$HAS_INVOKER" ]; then
      echo "✅ Service account has roles/run.invoker permission"
    else
      echo "❌ Service account does NOT have roles/run.invoker permission"
      echo "   This may be a separate issue, but the main bug is the missing audience field."
    fi
    
    echo ""
    echo "IAM Bindings:"
    echo "$IAM_POLICY" | jq -r '.bindings[]? | "  Role: \(.role)\n  Members: \(.members | join(", "))\n"'
  else
    echo "⚠️  Could not retrieve IAM policy for service: $BASE_SERVICE_NAME"
    echo "   This might be because the service name format is different."
    echo "   You can manually check IAM permissions in Cloud Run console."
  fi
else
  echo "⚠️  Could not extract service name from URI: $URI"
  echo "   Skipping IAM check. Please verify manually in Cloud Run console."
fi

echo ""
echo "=========================================="
echo ""

# Summary
if [ "$BUG_DETECTED" = true ]; then
  echo "SUMMARY:"
  echo "  ❌ BUG CONFIRMED: OIDC token is missing the 'audience' field"
  echo "  This will cause PERMISSION_DENIED errors when Cloud Scheduler tries to invoke the function."
  echo ""
  echo "  Expected OIDC token configuration:"
  echo "    {"
  echo "      \"serviceAccountEmail\": \"$SERVICE_ACCOUNT\","
  echo "      \"audience\": \"$URI\""
  echo "    }"
  echo ""
  echo "  Actual OIDC token configuration:"
  echo "    {"
  echo "      \"serviceAccountEmail\": \"$SERVICE_ACCOUNT\""
  echo "      // Missing: \"audience\" field"
  echo "    }"
  exit 1
else
  echo "SUMMARY:"
  echo "  ✅ No bug detected. OIDC token has the 'audience' field."
  echo "  If you're still experiencing PERMISSION_DENIED errors,"
  echo "  please check IAM permissions and service account configuration."
  exit 0
fi

