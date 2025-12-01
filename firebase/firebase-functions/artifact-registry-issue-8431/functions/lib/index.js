"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestID = void 0;
const app_1 = require("firebase-admin/app");
const https_1 = require("firebase-functions/v2/https");
(0, app_1.initializeApp)();
/**
 * Simple Gen 2 HTTP function to reproduce issue #8431.
 * This function triggers Cloud Build during deployment, which requires
 * the default compute service account to have roles/cloudbuild.builds.builder.
 */
exports.getLatestID = (0, https_1.onRequest)((request, response) => {
    response.json({
        id: Date.now(),
        message: "Hello from Firebase Functions!",
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=index.js.map