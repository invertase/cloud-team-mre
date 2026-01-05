import { initializeApp } from "firebase-admin/app";
import { onSchedule, ScheduledEvent } from "firebase-functions/v2/scheduler";

// Initialize Firebase Admin
initializeApp();

/**
 * FAILING SCHEDULER - Uses string parameter syntax
 * 
 * This function will create a Cloud Scheduler job with an INCORRECT v1 URL format:
 * https://us-central1-PROJECT.cloudfunctions.net/failingScheduler
 * 
 * This causes PERMISSION_DENIED errors when the scheduler tries to invoke it.
 */
export const failingScheduler = onSchedule(
  "every 1 minutes",
  async (event: ScheduledEvent) => {
    console.log("Failing scheduler executed at:", event.scheduleTime);
    console.log("Job name:", event.jobName);
    return;
  }
);

/**
 * WORKING SCHEDULER - Uses object parameter syntax
 * 
 * This function correctly creates a Cloud Scheduler job with the v2 Cloud Run URL format:
 * https://workingscheduler-HASH-uc.a.run.app/
 * 
 * This works correctly and executes without errors.
 */
export const workingScheduler = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "America/Los_Angeles",
  },
  async (event: ScheduledEvent) => {
    console.log("Working scheduler executed at:", event.scheduleTime);
    console.log("Job name:", event.jobName);
    return;
  }
);

