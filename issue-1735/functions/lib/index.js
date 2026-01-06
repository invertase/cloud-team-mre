"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issue1735Scheduler = void 0;
const app_1 = require("firebase-admin/app");
const scheduler_1 = require("firebase-functions/v2/scheduler");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
/**
 * TEST SCHEDULER - Demonstrates PERMISSION_DENIED bug
 *
 * This function uses the object syntax (to avoid issue #1734 with string syntax).
 * The Cloud Scheduler job will be created with:
 * - Correct v2 Cloud Run URL (format: https://testScheduler-HASH-uc.a.run.app/)
 * - Correct IAM permissions (roles/run.invoker for service account)
 * - OIDC token with serviceAccountEmail
 *
 * BUT the OIDC token is missing the 'audience' field, which causes
 * PERMISSION_DENIED errors when Cloud Scheduler tries to invoke it.
 *
 * Manual invocation with proper OIDC token and audience works fine,
 * proving the function and IAM are correct - only the Cloud Scheduler
 * OIDC token configuration is wrong.
 */
exports.issue1735Scheduler = (0, scheduler_1.onSchedule)({
    schedule: "every 2 minutes",
    timeZone: "America/Los_Angeles",
}, async (event) => {
    console.log("Test scheduler executed at:", event.scheduleTime);
    console.log("Job name:", event.jobName);
    console.log("Execution timestamp:", new Date().toISOString());
    return;
});
//# sourceMappingURL=index.js.map