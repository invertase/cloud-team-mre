"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workingScheduler = exports.failingScheduler = void 0;
const app_1 = require("firebase-admin/app");
const scheduler_1 = require("firebase-functions/v2/scheduler");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
/**
 * FAILING SCHEDULER - Uses string parameter syntax
 *
 * This function will create a Cloud Scheduler job with an INCORRECT v1 URL format:
 * https://us-central1-PROJECT.cloudfunctions.net/failingScheduler
 *
 * This causes PERMISSION_DENIED errors when the scheduler tries to invoke it.
 */
exports.failingScheduler = (0, scheduler_1.onSchedule)("every 1 minutes", async (event) => {
    console.log("Failing scheduler executed at:", event.scheduleTime);
    console.log("Job name:", event.jobName);
    return;
});
/**
 * WORKING SCHEDULER - Uses object parameter syntax
 *
 * This function correctly creates a Cloud Scheduler job with the v2 Cloud Run URL format:
 * https://workingscheduler-HASH-uc.a.run.app/
 *
 * This works correctly and executes without errors.
 */
exports.workingScheduler = (0, scheduler_1.onSchedule)({
    schedule: "every 1 minutes",
    timeZone: "America/Los_Angeles",
}, async (event) => {
    console.log("Working scheduler executed at:", event.scheduleTime);
    console.log("Job name:", event.jobName);
    return;
});
//# sourceMappingURL=index.js.map