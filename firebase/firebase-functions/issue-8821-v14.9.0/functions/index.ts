import { initializeApp } from "firebase-admin/app";
import { onRequest as onRequestV1 } from "firebase-functions/v1/https";

// Initialize Firebase Admin
initializeApp();

// Sample v1 HTTP function
export const issue8821_v14_9_0 = onRequestV1((request, response) => {
  response.json({
    message: "Hello from Firebase Functions!",
    timestamp: new Date().toISOString(),
  });
});
