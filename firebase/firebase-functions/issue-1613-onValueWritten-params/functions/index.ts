import { onValueWritten } from "firebase-functions/v2/database";
import { defineString } from "firebase-functions/params";

export const foo = onValueWritten(
  {
    ref: "/foo/bar",
    instance: defineString("REALTIME_INSTANCE"),
  },
  async (change) => {
    console.log("hey!");
  }
);
