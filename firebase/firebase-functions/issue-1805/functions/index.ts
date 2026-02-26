import { initializeApp } from "firebase-admin/app";
import * as functions from "firebase-functions/v1";

initializeApp();

export const onAuthUserCreate_v1 = functions.auth.user().onCreate((user) => {
  console.log("New user created:", user.uid);
  return Promise.resolve();
});
