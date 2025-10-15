import {
  beforeUserCreated,
  beforeUserSignedIn,
} from "firebase-functions/v2/identity";

export const beforeCreate = beforeUserCreated((event) => {
  console.log("beforeUserCreated triggered");
  return;
});

export const beforeSignIn = beforeUserSignedIn((event) => {
  console.log("beforeUserSignedIn triggered");
  return;
});
