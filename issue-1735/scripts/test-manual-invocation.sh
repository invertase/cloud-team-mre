#!/bin/bash

# Manual invocation test script for onSchedule PERMISSION_DENIED bug (#1735)
# This script demonstrates that manual invocation works with proper OIDC token,
# proving the function and IAM permissions are correct.
# The bug is specifically with Cloud Scheduler's OIDC token configuration.

set -e

PROJECT_ID="${PROJECT_ID:-}"
FUNCTION_URL="${FUNCTION_URL:-}"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID environment variable is required"
  echo "Usage: PROJECT_ID=your-project-id FUNCTION_URL=https://function-url.run.app ./scripts/test-manual-invocation.sh"
  exit 1
fi

if [ -z "$FUNCTION_URL" ]; then
  echo "Error: FUNCTION_URL environment variable is required"
  echo "Usage: PROJECT_ID=your-project-id FUNCTION_URL=https://function-url.run.app ./scripts/test-manual-invocation.sh"
  echo ""
  echo "You can find the FUNCTION_URL from:"
  echo "  1. Firebase deployment output"
  echo "  2. Cloud Run console"
  echo "  3. Running: gcloud functions describe testScheduler --gen2 --region=us-central1 --format='value(serviceConfig.uri)'"
  exit 1
fi

echo "Testing manual invocation of Cloud Run function"
echo "=========================================="
echo ""
echo "Project ID: $PROJECT_ID"
echo "Function URL: $FUNCTION_URL"
echo ""

# Get the default compute service account
SERVICE_ACCOUNT="${PROJECT_ID}-compute@developer.gserviceaccount.com"

echo "Using service account: $SERVICE_ACCOUNT"
echo ""

# Get an identity token with proper audience
echo "Step 1: Generating OIDC identity token with audience..."
echo "  Command: gcloud auth print-identity-token --impersonate-service-account=$SERVICE_ACCOUNT --audiences=$FUNCTION_URL"
echo ""

TOKEN=$(gcloud auth print-identity-token \
  --impersonate-service-account="$SERVICE_ACCOUNT" \
  --audiences="$FUNCTION_URL" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to generate identity token"
  echo ""
  echo "Make sure:"
  echo "  1. You have permission to impersonate the service account"
  echo "  2. The service account exists: $SERVICE_ACCOUNT"
  echo "  3. You're authenticated: gcloud auth login"
  exit 1
fi

echo "✅ Identity token generated successfully"
echo "   Token length: ${#TOKEN} characters"
echo ""

# Invoke the function
echo "Step 2: Invoking Cloud Run function..."
echo "  Command: curl -X POST $FUNCTION_URL -H 'Authorization: Bearer <token>'"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$FUNCTION_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-CloudScheduler-JobName: manual-test" \
  -H "X-CloudScheduler-ScheduleTime: $(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -d '{}' 2>&1)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

echo "Response:"
echo "  HTTP Status: $HTTP_STATUS"
if [ -n "$BODY" ]; then
  echo "  Body: $BODY"
fi
echo ""

# Check result
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ SUCCESS: Manual invocation works!"
  echo ""
  echo "This proves:"
  echo "  ✅ The Cloud Run function is deployed and working"
  echo "  ✅ IAM permissions are correct (service account has roles/run.invoker)"
  echo "  ✅ The function can be invoked with proper OIDC token and audience"
  echo ""
  echo "The PERMISSION_DENIED error from Cloud Scheduler is caused by:"
  echo "  ❌ Missing 'audience' field in Cloud Scheduler's OIDC token configuration"
  echo ""
  echo "Cloud Scheduler needs the 'audience' field set to: $FUNCTION_URL"
  exit 0
elif [ "$HTTP_STATUS" = "403" ]; then
  echo "❌ PERMISSION_DENIED: Manual invocation also fails"
  echo ""
  echo "This suggests the IAM permissions might not be set correctly."
  echo "Please check:"
  echo "  1. Cloud Run service IAM policy"
  echo "  2. Service account has roles/run.invoker role"
  echo "  3. Service account exists: $SERVICE_ACCOUNT"
  exit 1
elif [ "$HTTP_STATUS" = "404" ]; then
  echo "❌ NOT_FOUND: Function URL might be incorrect"
  echo "   Please verify the FUNCTION_URL: $FUNCTION_URL"
  exit 1
else
  echo "⚠️  Unexpected HTTP status: $HTTP_STATUS"
  echo "   Response: $BODY"
  exit 1
fi

