import { initializeApp } from "firebase-admin/app";
import { onRequest as onRequestV1 } from "firebase-functions/v1/https";
import { firestore as firestoreV1 } from "firebase-functions/v1";
import { onRequest as onRequestV2 } from "firebase-functions/v2/https";
import { onDocumentCreated as onDocumentCreatedV2 } from "firebase-functions/v2/firestore";

// Initialize Firebase Admin
initializeApp();

// Sample v1 HTTP function
export const helloWorld_v1 = onRequestV1((request, response) => {
  response.json({
    message: "Hello from Firebase Functions!",
    timestamp: new Date().toISOString(),
  });
});

// Sample v2 HTTP function
export const helloWorld_v2 = onRequestV2((request, response) => {
  response.json({
    message: "Hello from Firebase Functions!",
    timestamp: new Date().toISOString(),
  });
});

// Sample v1 Firestore trigger
export const onDocumentCreated_v1 = firestoreV1.document(
  "collection/{documentId}"
).onCreate(
  (snap, context) => {
    const newValue = snap.data();
    console.log("New document created:", snap.id, newValue);
    return null;
  }
);

// Sample v2 Firestore trigger
export const onDocumentCreated_v2 = onDocumentCreatedV2(
  "collection/{documentId}",
  (event) => {
    const newValue = event.data?.data();
    console.log("New document created:", event.params.documentId, newValue);
    return null;
  }
);
