import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

// Initialize Firebase Admin
initializeApp();

// Sample HTTP function
export const helloWorld = onRequest((request, response) => {
  response.json({
    message: "Hello from Firebase Functions!",
    timestamp: new Date().toISOString(),
  });
});

// Sample Firestore trigger
export const onDocumentCreated = onDocumentCreated(
  "collection/{documentId}",
  (event) => {
    const newValue = event.data.data();
    console.log("New document created:", event.params.documentId, newValue);
    return null;
  }
);
