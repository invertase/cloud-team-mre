import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

initializeApp();

export const logMessage = onRequest((_request, response) => {
  logger.info({ message: "Hello from Firebase v2!", test: "hello" });
  logger.info("Hey there!");
  logger.info({ year: "2026", test: "hello", reason: "mre" });
  response.json({ ok: true, note: "Check function logs for logger output" });
});
