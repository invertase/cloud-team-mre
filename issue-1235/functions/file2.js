import { functions, RUNTIME_OPTS } from "./localized-functions.js";

// Calling .region() here mutates the shared RUNTIME_OPTS object
console.log("Before .region():", JSON.stringify(RUNTIME_OPTS, null, 2));

export const myOtherTrigger = functions.region("europe-west1").https.onCall(
  async (data, context) => {
    return {
      message: "This function should be in europe-west1",
      region: "europe-west1",
      timestamp: new Date().toISOString(),
    };
  }
);

console.log("After .region():", JSON.stringify(RUNTIME_OPTS, null, 2));
