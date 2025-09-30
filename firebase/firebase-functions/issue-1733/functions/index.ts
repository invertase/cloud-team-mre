import { initializeApp } from "firebase-admin/app"; 
import { onRequest as onRequestV2 } from "firebase-functions/v2/https"; 

// Initialize Firebase Admin
initializeApp();

export const minScaleIssue = onRequestV2({
  minInstances: 0,
  maxInstances: 10,
  concurrency: 1000,
  memory: "256MiB",
  timeoutSeconds: 60,
  cpu: 1,
  region: "us-central1"
}, (request, response) => {
  response.json({
    message: "Test function for minScale annotation issue",
    timestamp: new Date().toISOString(),
    request: {
      method: request.method,
      url: request.url,
      headers: request.headers
    }
  });
});
