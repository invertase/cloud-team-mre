# Firebase Tools #8447 - Eventarc Custom Audience Misconfiguration

This MRE demonstrates that Firebase v2 Cloud Functions using `onCustomEventPublished` (Eventarc triggers) fail to receive events after deployment because:

1. The Cloud Run service doesn't have the correct custom audience configured
2. Required IAM permissions are missing for the PubSub service account

## Original Issue Report

> I attempted to post this inside of firebase support, but the window just went away and I got no confirmation, so it could possibly be cross posted, sorry I can't tell.
>
> **[REQUIRED] Environment info**
> This is a function running with onCustomEventPublished using a v2 cloudrun cloudfunction deployed by firebase deploy.
>
> firebase-tools:
> ```
> ❯ firebase --version
> 14.1.0
> ```
> Platform: macOS, GCP (eventarc, pub/sub)
>
> **[REQUIRED] Steps to reproduce**
> 1. `firebase deploy --only functions`
> 2. Send some messages into the eventarc
> 3. They will not get ack'd
>
> **[REQUIRED] Expected behavior**
> `firebase deploy --only functions` should properly deploy functions to work with the eventarc.
>
> **[REQUIRED] Actual behavior**
> Push messages from pubsub are denied with `permission_denied`.
> The audit logs are almost impossible to find. They show up in some audit logs after making some of the fixes. Before then there are no logs, but the messages just accumulate inside of pubsub.

## Workaround Script

The original reporter uses this script after each `firebase deploy` to fix the misconfiguration:

```bash
#!/bin/bash
# deploy-firebase-function.sh - Deploy a Firebase function and fix audience configuration
# Usage: ./deploy-firebase-function.sh [--skip-deploy] FUNCTION_NAME
# Example: ./deploy-firebase-function.sh stripeCheckoutCompleted
# Example with skip: ./deploy-firebase-function.sh --skip-deploy stripeCheckoutCompleted

set -e  # Exit on any error

SKIP_DEPLOY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --skip-deploy)
      SKIP_DEPLOY=true
      shift
      ;;
    *)
      FUNCTION_NAME="$1"
      shift
      ;;
  esac
done

if [ -z "$FUNCTION_NAME" ]; then
  echo "Error: Function name is required"
  echo "Usage: ./deploy-firebase-function.sh [--skip-deploy] FUNCTION_NAME"
  echo "Example: ./deploy-firebase-function.sh stripeCheckoutCompleted"
  echo "Example with skip: ./deploy-firebase-function.sh --skip-deploy stripeCheckoutCompleted"
  exit 1
fi

PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"  # Firebase Cloud Functions default region
SERVICE_NAME=$(echo "$FUNCTION_NAME" | tr '[:upper:]' '[:lower:]')

echo "Function name: $FUNCTION_NAME"
echo "Cloud Run service name will be: $SERVICE_NAME"

# Deploy the function using Firebase if not skipped
if [ "$SKIP_DEPLOY" = false ]; then
  echo "Deploying Firebase function: $FUNCTION_NAME"
  firebase deploy --only functions:$FUNCTION_NAME
  echo "Deployment complete. Fixing audience configuration..."
else
  echo "Skipping deployment, only fixing audience configuration..."
fi

# Wait a moment for deployment to fully complete
sleep 5

# Find the latest subscription for this function
SUBSCRIPTION=$(gcloud pubsub subscriptions list --format="value(name)" --filter="name~eventarc-us-central1-$SERVICE_NAME" | head -n 1)

if [ -z "$SUBSCRIPTION" ]; then
  echo "Error: Could not find PubSub subscription for $SERVICE_NAME"
  exit 1
fi

echo "Found subscription: $SUBSCRIPTION"

# Get the PubSub push endpoint audience
PUBSUB_AUDIENCE=$(gcloud pubsub subscriptions describe "$SUBSCRIPTION" --format='value(pushConfig.oidcToken.audience)')

if [ -z "$PUBSUB_AUDIENCE" ]; then
  echo "Error: Could not determine PubSub audience"
  exit 1
fi

echo "PubSub is using audience: $PUBSUB_AUDIENCE"

# Get current audience configuration from Cloud Run
CURRENT_AUDIENCES=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format='value(labels."run.googleapis.com/custom-audiences")' 2>/dev/null || echo "[]")

# Convert from JSON string to actual string array
CURRENT_AUDIENCES=$(echo "$CURRENT_AUDIENCES" | tr -d '[]"' | tr ',' ' ')

# Check if the PubSub audience is already in the list
if [[ "$CURRENT_AUDIENCES" == *"$PUBSUB_AUDIENCE"* ]]; then
  echo "PubSub audience is already configured in Cloud Run. No changes needed."
  exit 0
fi

# Get project number and service accounts
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
PUBSUB_SA="service-${PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com"

# Add IAM permission for the service accounts
echo "Adding IAM permissions for service accounts..."
gcloud run services add-iam-policy-binding "$SERVICE_NAME" \
  --region="$REGION" \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/run.invoker"

gcloud run services add-iam-policy-binding "$SERVICE_NAME" \
  --region="$REGION" \
  --member="serviceAccount:${PUBSUB_SA}" \
  --role="roles/run.invoker"

# Add necessary roles to the PubSub service account
# eventarc.eventReceiver - Required for receiving Eventarc events
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PUBSUB_SA}" \
  --role="roles/eventarc.eventReceiver"

# iam.serviceAccountTokenCreator - Required for creating tokens for authentication
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PUBSUB_SA}" \
  --role="roles/iam.serviceAccountTokenCreator"

# Add the PubSub audience to the Cloud Run service
echo "Adding PubSub audience to Cloud Run service..."
gcloud run services update "$SERVICE_NAME" \
  --region="$REGION" \
  --add-custom-audiences="$PUBSUB_AUDIENCE"

echo "Configuration complete!"
echo "Cloud Run service $SERVICE_NAME now accepts audiences:"
gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format='value(labels."run.googleapis.com/custom-audiences")'

echo "Done! Function $FUNCTION_NAME is ready to receive events."
```

---

## MRE Reproduction Results

This MRE was tested and successfully confirmed the bug:

```
========================================
Firebase Issue #8421 - Bug Verification
========================================

Project: <YOUR_PROJECT_ID>
Function: testEventHandler
Cloud Run Service: testeventhandler
Region: us-central1

Step 1: Finding PubSub subscription...
  Found: projects/<YOUR_PROJECT_ID>/subscriptions/eventarc-us-central1-testeventhandler-XXXXXX-sub-XXX

Step 2: Getting PubSub OIDC token audience...
  PubSub expects audience: https://testeventhandler-XXXXXXXXXX-uc.a.run.app

Step 3: Getting Cloud Run custom audiences...
  Cloud Run accepts: (none configured)

Step 4: Checking for unacknowledged messages...
  Unacked messages:

Step 5: Checking IAM bindings on Cloud Run service...
  Compute SA (<PROJECT_NUMBER>-compute@developer.gserviceaccount.com):
    run.invoker: NO
  PubSub SA (service-<PROJECT_NUMBER>@gcp-sa-pubsub.iam.gserviceaccount.com):
    run.invoker: NO

========================================
DIAGNOSIS SUMMARY
========================================
[BUG] Audience mismatch detected!
  PubSub sends tokens with audience: https://testeventhandler-XXXXXXXXXX-uc.a.run.app
  Cloud Run does not have this in custom-audiences

[BUG] Missing IAM bindings detected!
  Service accounts need roles/run.invoker on the Cloud Run service

========================================
BUG CONFIRMED: Firebase Issue #8421
========================================

firebase deploy does not properly configure:
1. Custom audiences on the Cloud Run service
2. IAM bindings for service accounts

This causes permission_denied errors when PubSub tries to
push events to the Cloud Run function.
```

---

## Prerequisites

- Node.js v20 or later
- Firebase CLI v14.1.0+ (`npm install -g firebase-tools`)
- Google Cloud CLI (`gcloud`)
- Firebase project with Blaze (pay-as-you-go) plan
- Authenticated with both Firebase and gcloud:
  ```bash
  firebase login
  gcloud auth login
  ```

## Setup

1. Configure your project:
   ```bash
   # Set your Firebase project
   firebase use YOUR_PROJECT_ID

   # Set your gcloud project (must match)
   gcloud config set project YOUR_PROJECT_ID
   ```

2. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

3. Build the TypeScript:
   ```bash
   npm run build
   ```

## Steps to Reproduce

### Step 1: Deploy the function

```bash
firebase deploy --only functions
```

The deployment will succeed, but the function is misconfigured.

### Step 2: Publish test events

```bash
chmod +x scripts/publish-event.sh
PROJECT_ID=your-project-id ./scripts/publish-event.sh 5
```

This publishes 5 custom events to Eventarc.

### Step 3: Wait and observe

Wait 30-60 seconds for events to be processed.

### Step 4: Verify the bug

```bash
chmod +x scripts/verify-bug.sh
PROJECT_ID=your-project-id ./scripts/verify-bug.sh
```

This script will:
- Find the PubSub subscription for the function
- Compare the OIDC token audience with Cloud Run's accepted audiences
- Check for unacknowledged messages accumulating in PubSub
- Verify IAM bindings are missing

## Expected Behavior

Events should be delivered to the function and acknowledged. The function should log:
```
EVENT RECEIVED - If you see this, the bug is fixed!
```

## Actual Behavior

- Messages accumulate in PubSub (not acknowledged)
- `permission_denied` errors appear in audit logs (hard to find)
- The function never receives the events
- No obvious errors in the Firebase deployment output

## Root Cause

`firebase deploy` does not properly configure:

1. **Custom audiences on Cloud Run**: PubSub sends an OIDC token with an audience URL, but Cloud Run is not configured to accept that audience.

2. **IAM bindings**: The following are missing:
   - `roles/run.invoker` for the compute service account
   - `roles/run.invoker` for the PubSub service account
   - `roles/eventarc.eventReceiver` for the PubSub service account
   - `roles/iam.serviceAccountTokenCreator` for the PubSub service account

## Verification Commands

Check if audience is misconfigured:

```bash
PROJECT_ID=$(gcloud config get-value project)
FUNCTION_NAME="testEventHandler"
SERVICE_NAME=$(echo "$FUNCTION_NAME" | tr '[:upper:]' '[:lower:]')
REGION="us-central1"

# Get what PubSub is using as audience
SUBSCRIPTION=$(gcloud pubsub subscriptions list --format="value(name)" --filter="name~eventarc-$REGION-$SERVICE_NAME" | head -n 1)
PUBSUB_AUDIENCE=$(gcloud pubsub subscriptions describe "$SUBSCRIPTION" --format='value(pushConfig.oidcToken.audience)')
echo "PubSub expects audience: $PUBSUB_AUDIENCE"

# Get what Cloud Run accepts
CLOUD_RUN_AUDIENCES=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format='value(spec.template.metadata.annotations."run.googleapis.com/custom-audiences")')
echo "Cloud Run accepts: $CLOUD_RUN_AUDIENCES"
```

If these don't match, you've confirmed the bug.

Check for unacked messages:

```bash
gcloud pubsub subscriptions describe "$SUBSCRIPTION" --format='value(numUndeliveredMessages)'
```

## Project Structure

```
eventarc-issue-8421/
├── functions/
│   ├── src/
│   │   └── index.ts          # Event handler using onCustomEventPublished
│   ├── package.json
│   └── tsconfig.json
├── scripts/
│   ├── publish-event.sh      # Publish custom events to Eventarc
│   └── verify-bug.sh         # Verify the misconfiguration
├── firebase.json
├── .firebaserc
└── README.md
```

## Environment Info

- firebase-tools: 14.1.0
- Platform: macOS / Linux
- GCP Services: Eventarc, Pub/Sub, Cloud Run

## Related Links

- [Firebase Support Issue](https://firebase.google.com/support) (if posted)
- [GitHub Issue #8421](https://github.com/firebase/firebase-tools/issues/8421) (pending)
