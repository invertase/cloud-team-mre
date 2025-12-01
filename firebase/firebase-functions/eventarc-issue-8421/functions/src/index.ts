import { initializeApp } from "firebase-admin/app";
import { onCustomEventPublished } from "firebase-functions/v2/eventarc";

initializeApp();

const EVENT_TYPE = "com.example.test.v1";

/**
 * Event handler that listens for custom Eventarc events.
 *
 * After deploying with `firebase deploy --only functions`, this function
 * will NOT receive events due to misconfigured Cloud Run audience and
 * missing IAM permissions.
 *
 * See README.md for reproduction steps and verification commands.
 */
export const testEventHandler = onCustomEventPublished(EVENT_TYPE, (event) => {
  console.log("========================================");
  console.log("EVENT RECEIVED - If you see this, the bug is fixed!");
  console.log("========================================");
  console.log("Event ID:", event.id);
  console.log("Event Type:", event.type);
  console.log("Event Time:", event.time);
  console.log("Event Data:", JSON.stringify(event.data, null, 2));
  console.log("========================================");
});
