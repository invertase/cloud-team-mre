import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";
import * as functions from "firebase-functions/v2";

// Initialize Firebase Admin
initializeApp();

/**
 * TEST 1: Direct error in handler (Baseline - Works Correctly)
 * 
 * This function throws an error directly in the handler.
 * Both emulator and production should show full stack traces.
 * 
 * Expected: Full stack trace in both emulator and production
 * Actual: Full stack trace in both (works correctly)
 */
export const errorHandlingTest1 = onRequest(async (request, response) => {
  try {
    let nre: any = null;
    nre.explode = "bang"; // This will throw: Cannot set properties of null
  } catch (e) {
    functions.logger.error("Error invoking function", e, {
      query: request.query,
      body: request.body,
    });
    response.sendStatus(500);
  }
});

/**
 * TEST 2: Error in synchronous function (Baseline - Works Correctly)
 * 
 * This function calls a synchronous function that throws an error.
 * Both emulator and production should show full stack traces.
 * 
 * Expected: Full stack trace in both emulator and production
 * Actual: Full stack trace in both (works correctly)
 */
function explodeSync(): void {
  let nre: any = null;
  nre.explode = "bang"; // This will throw: Cannot set properties of null
}

export const errorHandlingTest2 = onRequest(async (request, response) => {
  try {
    explodeSync();
  } catch (e) {
    functions.logger.error("Error invoking function", e, {
      query: request.query,
      body: request.body,
    });
    response.sendStatus(500);
  }
});

/**
 * TEST 3: Error in async function (BUG - Truncated Stack Trace)
 * 
 * This function calls an async function that throws an error.
 * The emulator shows full stack traces, but production Error Reporting UI
 * only shows the last stack frame (truncated).
 * 
 * Expected: Full stack trace in both emulator and production
 * Actual: 
 *   - Emulator: Full stack trace ✓
 *   - Production Error Reporting UI: Truncated (only last frame) ✗
 *   - Production Cloud Logging: Full stack trace ✓ (workaround)
 */
async function explodeAsync(): Promise<void> {
  await new Promise((r) => setTimeout(r, 1));
  let nre: any = null;
  nre.explode = "bang"; // This will throw: Cannot set properties of null
}

export const errorHandlingTest3 = onRequest(async (request, response) => {
  try {
    await explodeAsync();
  } catch (e) {
    functions.logger.error("Error invoking function", e, {
      query: request.query,
      body: request.body,
    });
    response.sendStatus(500);
  }
});

