import { initializeApp } from "firebase-admin/app";
import { onSchedule, ScheduledEvent } from "firebase-functions/v2/scheduler";

// Initialize Firebase Admin
initializeApp();

export const issue1735Scheduler = onSchedule(
  {
    schedule: "every 2 minutes",
    timeZone: "America/Los_Angeles",
  },
  async (event: ScheduledEvent) => {
    console.log("Test scheduler executed at:", event.scheduleTime);
    console.log("Job name:", event.jobName);
    console.log("Execution timestamp:", new Date().toISOString());
    return;
  }
);

