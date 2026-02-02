import { initializeApp } from "firebase-admin/app";
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from "firebase-functions/v2/identity";

export const beforecreated = beforeUserCreated((event) => {
  console.log("befoerUserCreated", event);
  return;
});

export const beforesignedin = beforeUserSignedIn((event) => {
  console.log("beforeUserSignedIn", event);
});

initializeApp();
