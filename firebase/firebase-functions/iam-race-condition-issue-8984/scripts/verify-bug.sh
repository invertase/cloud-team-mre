#!/bin/bash
# verify-bug.sh - Verify the IAM policy race condition bug
# Usage: PROJECT_ID=your-project ./verify-bug.sh [FUNCTION_NAME]
# Example: PROJECT_ID=my-project ./verify-bug.sh
# Example: PROJECT_ID=my-project ./verify-bug.sh helloFailingInitialDeploy

set -e

FUNCTION_NAME=${1:-helloFailingInitialDeploy}
REGION=${REGION:-us-central1}

# Use PROJECT_ID env var, or fall back to gcloud default
if [ -z "$PROJECT_ID" ]; then
  PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
fi

if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID not set."
  echo "Usage: PROJECT_ID=your-project ./verify-bug.sh [FUNCTION_NAME]"
  exit 1
fi

SERVICE_NAME=$(echo "$FUNCTION_NAME" | tr '[:upper:]' '[:lower:]')

COLORS_RED='\033[0;31m'
COLORS_GREEN='\033[0;32m'
COLORS_YELLOW='\033[1;33m'
COLORS_BLUE='\033[0;34m'
COLORS_NC='\033[0m' # No Color

echo -e "${COLORS_BLUE}========================================${COLORS_NC}"
echo -e "${COLORS_BLUE}IAM Policy Race Condition - Verification${COLORS_NC}"
echo -e "${COLORS_BLUE}========================================${COLORS_NC}"
echo ""
echo "Project: $PROJECT_ID"
echo "Function: $FUNCTION_NAME"
echo "Cloud Run Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Step 1: Check if the Cloud Run service exists
echo -e "${COLORS_YELLOW}Step 1: Checking if Cloud Run service exists...${COLORS_NC}"
SERVICE_EXISTS=$(gcloud run services list --project="$PROJECT_ID" --region="$REGION" --format="value(name)" --filter="metadata.name=$SERVICE_NAME" 2>/dev/null || echo "")

if [ -z "$SERVICE_EXISTS" ]; then
  echo -e "  ${COLORS_RED}Service not found: $SERVICE_NAME${COLORS_NC}"
  echo "  Deploy the function first with: firebase deploy --only functions"
  exit 1
fi

echo -e "  Found: ${COLORS_GREEN}$SERVICE_NAME${COLORS_NC}"
echo ""

# Step 2: Get the function URL
echo -e "${COLORS_YELLOW}Step 2: Getting function URL...${COLORS_NC}"
FUNCTION_URL=$(gcloud run services describe "$SERVICE_NAME" --project="$PROJECT_ID" --region="$REGION" --format="value(status.url)" 2>/dev/null)

if [ -z "$FUNCTION_URL" ]; then
  echo -e "  ${COLORS_RED}Could not get function URL${COLORS_NC}"
  exit 1
fi

echo -e "  URL: ${COLORS_GREEN}$FUNCTION_URL${COLORS_NC}"
echo ""

# Step 3: Check IAM policy
echo -e "${COLORS_YELLOW}Step 3: Checking IAM policy...${COLORS_NC}"
IAM_POLICY=$(gcloud run services get-iam-policy "$SERVICE_NAME" --project="$PROJECT_ID" --region="$REGION" --format=json 2>/dev/null || echo "{}")

HAS_ALL_USERS=$(echo "$IAM_POLICY" | grep -c "allUsers" 2>/dev/null || echo "0")

if [ "$HAS_ALL_USERS" != "0" ] && [ -n "$HAS_ALL_USERS" ]; then
  echo -e "  Public access (allUsers): ${COLORS_GREEN}YES${COLORS_NC}"
  PUBLIC_ACCESS="true"
else
  echo -e "  Public access (allUsers): ${COLORS_RED}NO${COLORS_NC}"
  PUBLIC_ACCESS="false"
fi
echo ""

# Step 4: Test the function
echo -e "${COLORS_YELLOW}Step 4: Testing function invocation...${COLORS_NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FUNCTION_URL" 2>/dev/null || echo "000")

echo -e "  HTTP Status: ${COLORS_YELLOW}$HTTP_CODE${COLORS_NC}"
echo ""

# Summary
echo -e "${COLORS_BLUE}========================================${COLORS_NC}"
echo -e "${COLORS_BLUE}DIAGNOSIS SUMMARY${COLORS_NC}"
echo -e "${COLORS_BLUE}========================================${COLORS_NC}"

if [ "$PUBLIC_ACCESS" = "false" ]; then
  echo -e "${COLORS_RED}[BUG] IAM policy missing 'allUsers' invoker permission!${COLORS_NC}"
  echo ""
  BUG_CONFIRMED="true"
else
  BUG_CONFIRMED="false"
fi

if [ "$HTTP_CODE" = "403" ]; then
  echo -e "${COLORS_RED}[SYMPTOM] Function returns 403 Forbidden${COLORS_NC}"
  echo "  The function requires authentication but should be public."
  echo ""
  BUG_CONFIRMED="true"
elif [ "$HTTP_CODE" = "200" ]; then
  echo -e "${COLORS_GREEN}[OK] Function returns 200 OK${COLORS_NC}"
  echo ""
fi

if [ "$BUG_CONFIRMED" = "true" ]; then
  echo -e "${COLORS_RED}========================================${COLORS_NC}"
  echo -e "${COLORS_RED}BUG CONFIRMED: IAM Policy Race Condition${COLORS_NC}"
  echo -e "${COLORS_RED}========================================${COLORS_NC}"
  echo ""
  echo "The function deployment succeeded but IAM policies were not applied."
  echo "This happens when:"
  echo "  1. Initial deploy failed (health check)"
  echo "  2. Cloud Run service was created but broken"
  echo "  3. Second deploy was treated as 'update' not 'create'"
  echo "  4. IAM policies are only set on 'create' operations"
  echo ""
  echo "Workaround: Run ./scripts/fix-iam.sh to manually add the policy"
else
  echo -e "${COLORS_GREEN}========================================${COLORS_NC}"
  echo -e "${COLORS_GREEN}NO BUG DETECTED${COLORS_NC}"
  echo -e "${COLORS_GREEN}========================================${COLORS_NC}"
  echo ""
  echo "The function has correct IAM policies and is publicly accessible."
fi
