import { https } from "firebase-functions/v2"; // This triggers the issue

export const withGuard = https.onCall(async (request) => {
  return { message: "ok" };
});
