import { initializeApp } from "firebase-admin/app";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";

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

export const schedulerWithRegion = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "America/Los_Angeles",
    region: "us-central1",
  },
  async () => {
    console.log("This function works correctly");
  }
);

export const helloWorldV2Issue1734 = onRequest((req, res) => {
  res.send("Hello from v2, issue 1734");
});
