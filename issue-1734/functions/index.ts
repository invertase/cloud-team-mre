import { initializeApp } from "firebase-admin/app";
import { onSchedule } from "firebase-functions/v2/scheduler";

initializeApp();

export const failingScheduler = onSchedule("every 1 minutes", async () => {
  console.log("This function gets PERMISSION_DENIED");
});

export const workingScheduler = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "America/Los_Angeles",
  },
  async () => {
    console.log("This function works correctly");
  }
);
