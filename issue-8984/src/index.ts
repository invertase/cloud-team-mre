import { onRequest } from "firebase-functions/https";

// The module that would not be included in the Cloud Run container.
// import { value } from "./feature.local/somethingModule";
const value = "some value";

export const helloFailingInitialDeploy = onRequest((request, response) => {
  response.send(`Hello from Firebase! The value is: ${value}`);
});