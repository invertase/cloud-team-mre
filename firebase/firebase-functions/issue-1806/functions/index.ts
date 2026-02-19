import { https } from "firebase-functions/v2";

export const withGuard = https.onCall(async (request) => {
  return { message: "ok" };
});
