import { functions } from "./localized-functions";

export const myTrigger = functions.https.onCall((data, context) => {
  console.log("myTrigger executed in region:", process.env.FUNCTION_REGION || "unknown");
  return {
    message: "Hello from myTrigger",
    region: process.env.FUNCTION_REGION || "unknown",
    timestamp: new Date().toISOString(),
  };
});

