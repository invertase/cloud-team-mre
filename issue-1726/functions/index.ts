import { onCall } from "firebase-functions/v2/https";
import { beforeUserCreated } from "firebase-functions/v2/identity";

import { getAuth } from "firebase-admin/auth";

import { initializeApp } from "firebase-admin/app";
initializeApp();

export const testFunction = onCall(async (request) => {
  const auth = getAuth();
  return { message: "Function works if subpath exports are created" };
});

export const beforeUserCreatedTrigger = beforeUserCreated(async (event) => {
  console.log("User created:", event.data.uid);
});

