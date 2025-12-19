import { onCall } from "firebase-functions/v2/https";
import { projectID } from "firebase-functions/params";

export const helloworldIssue1715 = onCall<unknown, string>(
  {
    cors: projectID.equals("something").thenElse(
      ["http://localhost:5173"],
      []
    ),
  },
  () => {
    return "Hello from Firebase!";
  }
);

