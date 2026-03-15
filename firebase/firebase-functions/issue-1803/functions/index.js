import { onDocumentCreated } from "firebase-functions/firestore";

export const userCreated = onDocumentCreated(
  {
    document: "users/{user_id}",
    database: "enterprise",
  },
  (event) => {
    console.log("User created:", event.params.user_id);
  }
);
