import { functions } from "./localized-functions";

export const myOtherTrigger = functions.region("europe-west1").https.onCall((data, context) => {
  console.log("myOtherTrigger executed in region:", process.env.FUNCTION_REGION || "unknown");
  return {
    message: "Hello from myOtherTrigger",
    region: process.env.FUNCTION_REGION || "unknown",
    timestamp: new Date().toISOString(),
  };
});

