#!/bin/bash
# verify-bug.sh - Verify the Eventarc audience misconfiguration bug
# Usage: PROJECT_ID=your-project ./verify-bug.sh [FUNCTION_NAME]
# Example: PROJECT_ID=my-project ./verify-bug.sh
# Example: PROJECT_ID=my-project ./verify-bug.sh testEventHandler

set -e

FUNCTION_NAME=${1:-testEventHandler}
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
echo -e "${COLORS_BLUE}Firebase Issue #8421 - Bug Verification${COLORS_NC}"
echo -e "${COLORS_BLUE}========================================${COLORS_NC}"
echo ""
echo "Project: $PROJECT_ID"
echo "Function: $FUNCTION_NAME"
echo "Cloud Run Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Step 1: Find the PubSub subscription
echo -e "${COLORS_YELLOW}Step 1: Finding PubSub subscription...${COLORS_NC}"
SUBSCRIPTION=$(gcloud pubsub subscriptions list --project="$PROJECT_ID" --format="value(name)" --filter="name~eventarc-$REGION-$SERVICE_NAME" 2>/dev/null | head -n 1)

if [ -z "$SUBSCRIPTION" ]; then
  echo -e "${COLORS_RED}  ERROR: Could not find PubSub subscription for $SERVICE_NAME${COLORS_NC}"
  echo "  Make sure you have deployed the function with: firebase deploy --only functions"
  echo ""
  echo "  Available subscriptions containing 'eventarc':"
  gcloud pubsub subscriptions list --project="$PROJECT_ID" --format="value(name)" --filter="name~eventarc" 2>/dev/null | head -10
  exit 1
fi

echo -e "  Found: ${COLORS_GREEN}$SUBSCRIPTION${COLORS_NC}"
echo ""

# Step 2: Get the audience that PubSub is using
echo -e "${COLORS_YELLOW}Step 2: Getting PubSub OIDC token audience...${COLORS_NC}"
PUBSUB_AUDIENCE=$(gcloud pubsub subscriptions describe "$SUBSCRIPTION" --project="$PROJECT_ID" --format='value(pushConfig.oidcToken.audience)' 2>/dev/null)

if [ -z "$PUBSUB_AUDIENCE" ]; then
  echo -e "${COLORS_RED}  ERROR: Could not determine PubSub audience${COLORS_NC}"
  exit 1
fi

echo -e "  PubSub expects audience: ${COLORS_GREEN}$PUBSUB_AUDIENCE${COLORS_NC}"
echo ""

# Step 3: Get the audiences that Cloud Run accepts
echo -e "${COLORS_YELLOW}Step 3: Getting Cloud Run custom audiences...${COLORS_NC}"
CLOUD_RUN_AUDIENCES=$(gcloud run services describe "$SERVICE_NAME" --project="$PROJECT_ID" --region="$REGION" --format='value(spec.template.metadata.annotations."run.googleapis.com/custom-audiences")' 2>/dev/null || echo "")

if [ -z "$CLOUD_RUN_AUDIENCES" ] || [ "$CLOUD_RUN_AUDIENCES" = "[]" ]; then
  echo -e "  Cloud Run accepts: ${COLORS_RED}(none configured)${COLORS_NC}"
  AUDIENCE_MATCH="false"
else
  echo -e "  Cloud Run accepts: ${COLORS_GREEN}$CLOUD_RUN_AUDIENCES${COLORS_NC}"
  if [[ "$CLOUD_RUN_AUDIENCES" == *"$PUBSUB_AUDIENCE"* ]]; then
    AUDIENCE_MATCH="true"
  else
    AUDIENCE_MATCH="false"
  fi
fi
echo ""

# Step 4: Check for unacked messages
echo -e "${COLORS_YELLOW}Step 4: Checking for unacknowledged messages...${COLORS_NC}"
UNACKED=$(gcloud pubsub subscriptions describe "$SUBSCRIPTION" --project="$PROJECT_ID" --format='value(numUndeliveredMessages)' 2>/dev/null || echo "0")
echo -e "  Unacked messages: ${COLORS_YELLOW}$UNACKED${COLORS_NC}"
echo ""

# Step 5: Check IAM bindings
echo -e "${COLORS_YELLOW}Step 5: Checking IAM bindings on Cloud Run service...${COLORS_NC}"
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)" 2>/dev/null)
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
PUBSUB_SA="service-${PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com"

IAM_POLICY=$(gcloud run services get-iam-policy "$SERVICE_NAME" --project="$PROJECT_ID" --region="$REGION" --format=json 2>/dev/null || echo "{}")

COMPUTE_HAS_INVOKER=$(echo "$IAM_POLICY" | grep -c "$COMPUTE_SA" 2>/dev/null || true)
PUBSUB_HAS_INVOKER=$(echo "$IAM_POLICY" | grep -c "$PUBSUB_SA" 2>/dev/null || true)

# Ensure we have integers
COMPUTE_HAS_INVOKER=${COMPUTE_HAS_INVOKER:-0}
PUBSUB_HAS_INVOKER=${PUBSUB_HAS_INVOKER:-0}

echo "  Compute SA ($COMPUTE_SA):"
if [ "$COMPUTE_HAS_INVOKER" != "0" ] && [ -n "$COMPUTE_HAS_INVOKER" ]; then
  echo -e "    run.invoker: ${COLORS_GREEN}YES${COLORS_NC}"
else
  echo -e "    run.invoker: ${COLORS_RED}NO${COLORS_NC}"
  COMPUTE_HAS_INVOKER=0
fi

echo "  PubSub SA ($PUBSUB_SA):"
if [ "$PUBSUB_HAS_INVOKER" != "0" ] && [ -n "$PUBSUB_HAS_INVOKER" ]; then
  echo -e "    run.invoker: ${COLORS_GREEN}YES${COLORS_NC}"
else
  echo -e "    run.invoker: ${COLORS_RED}NO${COLORS_NC}"
  PUBSUB_HAS_INVOKER=0
fi
echo ""

# Summary
echo -e "${COLORS_BLUE}========================================${COLORS_NC}"
echo -e "${COLORS_BLUE}DIAGNOSIS SUMMARY${COLORS_NC}"
echo -e "${COLORS_BLUE}========================================${COLORS_NC}"

BUG_CONFIRMED="false"

if [ "$AUDIENCE_MATCH" = "false" ]; then
  echo -e "${COLORS_RED}[BUG] Audience mismatch detected!${COLORS_NC}"
  echo "  PubSub sends tokens with audience: $PUBSUB_AUDIENCE"
  echo "  Cloud Run does not have this in custom-audiences"
  echo ""
  BUG_CONFIRMED="true"
fi

if [ "$COMPUTE_HAS_INVOKER" = "0" ] || [ "$PUBSUB_HAS_INVOKER" = "0" ]; then
  echo -e "${COLORS_RED}[BUG] Missing IAM bindings detected!${COLORS_NC}"
  echo "  Service accounts need roles/run.invoker on the Cloud Run service"
  echo ""
  BUG_CONFIRMED="true"
fi

if [ -n "$UNACKED" ] && [ "$UNACKED" != "0" ]; then
  echo -e "${COLORS_YELLOW}[SYMPTOM] $UNACKED unacked messages in PubSub${COLORS_NC}"
  echo "  Messages are accumulating because the function cannot receive them"
  echo ""
fi

if [ "$BUG_CONFIRMED" = "true" ]; then
  echo -e "${COLORS_RED}========================================${COLORS_NC}"
  echo -e "${COLORS_RED}BUG CONFIRMED: Firebase Issue #8421${COLORS_NC}"
  echo -e "${COLORS_RED}========================================${COLORS_NC}"
  echo ""
  echo "firebase deploy does not properly configure:"
  echo "1. Custom audiences on the Cloud Run service"
  echo "2. IAM bindings for service accounts"
  echo ""
  echo "This causes permission_denied errors when PubSub tries to"
  echo "push events to the Cloud Run function."
else
  echo -e "${COLORS_GREEN}========================================${COLORS_NC}"
  echo -e "${COLORS_GREEN}NO BUG DETECTED${COLORS_NC}"
  echo -e "${COLORS_GREEN}========================================${COLORS_NC}"
  echo ""
  echo "The function appears to be configured correctly."
  echo "If you're still having issues, check Cloud Run logs:"
  echo "  gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME' --project=$PROJECT_ID --limit=20"
fi
