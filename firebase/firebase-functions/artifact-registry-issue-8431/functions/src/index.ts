import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";

initializeApp();

/**
 * Simple Gen 2 HTTP function to reproduce issue #8431.
 * This function triggers Cloud Build during deployment, which requires
 * the default compute service account to have roles/cloudbuild.builds.builder.
 */
export const getLatestID = onRequest((request, response) => {
  response.json({
    id: Date.now(),
    message: "Hello from Firebase Functions!",
    timestamp: new Date().toISOString(),
  });
});
