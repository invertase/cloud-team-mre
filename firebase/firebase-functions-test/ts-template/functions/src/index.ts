import { initializeApp } from "firebase-admin/app";
import { onCall as onCallV1 } from "firebase-functions/v1/https";
import { onCall as onCallV2 } from "firebase-functions/v2/https";

// Initialize Firebase Admin
initializeApp();

// Sample v1 call function
export const helloWorld_v1 = onCallV1((request, response) => {
  return {
    message: "Hello from Firebase Functions!",
  };
});

// Sample v2 call function
export const helloWorld_v2 = onCallV2((request, response) => {
  return {
    message: "Hello from Firebase Functions!",
  };
});
