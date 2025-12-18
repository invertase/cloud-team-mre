import { initializeApp } from "firebase-admin/app";
import { onSchedule } from "firebase-functions/v2/scheduler";

initializeApp();

export const testScheduler = onSchedule(
  {
    schedule: "every 2 minutes",
    timeZone: "America/Los_Angeles",
  },
  async () => {
    console.log("Test scheduler executed at", new Date().toISOString());
  }
);

