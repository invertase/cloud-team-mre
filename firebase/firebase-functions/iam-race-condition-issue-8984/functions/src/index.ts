import { onRequest } from "firebase-functions/v2/https";

/**
 * BUGGY VERSION - This import will cause the deployment to fail!
 *
 * The feature.local/ directory is excluded by the *.local ignore pattern
 * in firebase.json. This means the module works locally but will fail
 * at runtime in Cloud Run because the file doesn't exist in the container.
 *
 * To fix: Replace this import with an inline value (see index.ts.fixed)
 */
import { value } from "./feature.local/somethingModule";

export const helloFailingInitialDeploy = onRequest((request, response) => {
  response.send(`Hello from Firebase! The value is: ${value}`);
});
