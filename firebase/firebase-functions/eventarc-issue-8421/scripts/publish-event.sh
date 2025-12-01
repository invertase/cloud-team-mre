#!/bin/bash
# publish-event.sh - Publish a custom event to Eventarc to trigger the function
# Usage: PROJECT_ID=your-project ./publish-event.sh [COUNT]
# Example: PROJECT_ID=my-project ./publish-event.sh       # Publish 1 event
# Example: PROJECT_ID=my-project ./publish-event.sh 5     # Publish 5 events

set -e

EVENT_TYPE="com.example.test.v1"
COUNT=${1:-1}
REGION=${REGION:-us-central1}

# Use PROJECT_ID env var, or fall back to gcloud default
if [ -z "$PROJECT_ID" ]; then
  PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
fi

if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID not set."
  echo "Usage: PROJECT_ID=your-project ./publish-event.sh [COUNT]"
  exit 1
fi

echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Event Type: $EVENT_TYPE"
echo "Publishing $COUNT event(s)..."
echo ""

# Find the Eventarc channel for custom events
CHANNEL=$(gcloud eventarc channels list --location="$REGION" --project="$PROJECT_ID" --format="value(name)" 2>/dev/null | head -n 1)

if [ -z "$CHANNEL" ]; then
  echo "No Eventarc channel found. Creating default channel..."
  gcloud eventarc channels create firebase-channel \
    --location="$REGION" \
    --project="$PROJECT_ID"
  CHANNEL="projects/$PROJECT_ID/locations/$REGION/channels/firebase-channel"
fi

echo "Using channel: $CHANNEL"
echo ""

for i in $(seq 1 $COUNT); do
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  EVENT_ID="test-event-$(date +%s)-$i"

  echo "[$i/$COUNT] Publishing event: $EVENT_ID"

  # Publish using gcloud eventarc
  gcloud eventarc channels publish "$CHANNEL" \
    --location="$REGION" \
    --project="$PROJECT_ID" \
    --event-type="$EVENT_TYPE" \
    --event-id="$EVENT_ID" \
    --event-data="{\"message\": \"Test event $i\", \"timestamp\": \"$TIMESTAMP\"}" \
    --event-source="//mre/eventarc-issue-8421"

  echo "   Published at $TIMESTAMP"

  # Small delay between events
  if [ $i -lt $COUNT ]; then
    sleep 1
  fi
done

echo ""
echo "Done! Published $COUNT event(s)."
echo ""
echo "Next steps:"
echo "1. Wait 30 seconds for events to be processed"
echo "2. Run: PROJECT_ID=$PROJECT_ID ./scripts/verify-bug.sh"
echo "3. Check Cloud Run logs: gcloud logging read 'resource.type=cloud_run_revision' --project=$PROJECT_ID --limit=20"
