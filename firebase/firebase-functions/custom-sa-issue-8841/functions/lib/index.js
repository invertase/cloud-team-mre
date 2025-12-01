"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testGroup = void 0;
const app_1 = require("firebase-admin/app");
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
(0, app_1.initializeApp)();
/**
 * IMPORTANT: Replace this with your custom service account email.
 * This should be a service account you created with the Editor role.
 *
 * Example: "my-custom-sa@your-project-id.iam.gserviceaccount.com"
 */
const CUSTOM_SERVICE_ACCOUNT = "compute-custom@test-multimodal-ext.iam.gserviceaccount.com";
/**
 * Set global options to use the custom service account.
 *
 * According to Firebase documentation, this should configure ALL functions
 * to use this service account instead of the default compute service account.
 *
 * BUG: Firebase CLI ignores this setting for buildConfig.serviceAccount,
 * causing deployment to fail when the default compute SA is deleted.
 */
(0, v2_1.setGlobalOptions)({
    serviceAccount: CUSTOM_SERVICE_ACCOUNT,
});
/**
 * Simple callable function to test deployment.
 *
 * This function uses a grouped export pattern (testGroup.addmessage)
 * as shown in the original issue report.
 */
const addmessage = (0, https_1.onCall)((_request) => {
    return {
        message: "Hello World - updated to force redeploy",
    };
});
/**
 * Export functions using the group pattern from the original issue.
 * This results in a function named "testGroup-addmessage" when deployed.
 */
exports.testGroup = {
    addmessage,
};
//# sourceMappingURL=index.js.map