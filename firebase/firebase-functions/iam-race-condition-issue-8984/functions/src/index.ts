import { onRequest } from "firebase-functions/v2/https";

/**
 * BUGGY VERSION - Imports from *.local directory which is excluded from deployment.
 * This causes the first deployment to fail the health check.
 *
 * After this fails, switch to the fixed version:
 *   cp functions/src/index.ts.fixed functions/src/index.ts
 */
import { value } from "./feature.local/somethingModule";

export const helloFailingInitialDeploy = onRequest((request, response) => {
  response.send(`Hello from Firebase! The value is: ${value}`);
});
