#!/usr/bin/env bash
# Usage: ./send.sh [port]
URL="http://localhost:${1:-8080}/"
BODY='{"message":{"attributes":{"k":"v"},"data":"aGk=","messageId":"1","message_id":"1","publishTime":"2026-11-04T19:00:00.123Z","publish_time":"2026-11-04T19:00:00.123Z"},"subscription":"projects/p/subscriptions/s"}'

echo "CloudEvent with ce-* headers:"
curl -s -o /dev/null -w "%{http_code}\n" "$URL" \
  -H 'Content-Type: application/json' \
  -H 'ce-id: 1' \
  -H 'ce-specversion: 1.0' \
  -H 'ce-type: google.cloud.pubsub.topic.v1.messagePublished' \
  -H 'ce-source: //pubsub.googleapis.com/projects/p/topics/issue-333' \
  -H 'ce-time: 2026-11-04T19:00:00.123Z' \
  -d "$BODY"

echo "Same body, no ce-* headers:"
curl -s -o /dev/null -w "%{http_code}\n" "$URL" \
  -H 'Content-Type: application/json' \
  -d "$BODY"
