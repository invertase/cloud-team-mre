import { functions } from "./localized-functions.js";

export const myTrigger = functions.https.onCall(async (data, context) => {
  return {
    message: "This function should be in europe-west3",
    region: "europe-west3",
    timestamp: new Date().toISOString(),
  };
});


