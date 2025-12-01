import { initializeApp } from "firebase-admin/app";
import { onCall } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

initializeApp();

/**
 * IMPORTANT: Replace this with your custom service account email.
 * This should be a service account you created with the Editor role.
 *
 * Example: "my-custom-sa@your-project-id.iam.gserviceaccount.com"
 */
const CUSTOM_SERVICE_ACCOUNT =
  "compute-custom@your-project-id.iam.gserviceaccount.com";

/**
 * Set global options to use the custom service account.
 *
 * According to Firebase documentation, this should configure ALL functions
 * to use this service account instead of the default compute service account.
 *
 * BUG: Firebase CLI ignores this setting for buildConfig.serviceAccount,
 * causing deployment to fail when the default compute SA is deleted.
 */
setGlobalOptions({
  serviceAccount: CUSTOM_SERVICE_ACCOUNT,
});

/**
 * Simple callable function to test deployment.
 *
 * This function uses a grouped export pattern (testGroup.addmessage)
 * as shown in the original issue report.
 */
const addmessage = onCall((_request) => {
  return {
    message: "Hello World",
  };
});

/**
 * Export functions using the group pattern from the original issue.
 * This results in a function named "testGroup-addmessage" when deployed.
 */
export const testGroup = {
  addmessage,
};
