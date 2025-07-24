import { initializeApp } from "firebase-admin/app";
import { onRequest as onRequestV2 } from "firebase-functions/v2/https";

initializeApp();

export const mininstancesrepro = onRequestV2(
  {
    minInstances: 0,
    maxInstances: 10,
    region: "us-central1",
  },
  (request: any, response: any) => {
    response.json({
      message: "Hello from Firebase Functions!",
      timestamp: new Date().toISOString(),
    });
  }
);
