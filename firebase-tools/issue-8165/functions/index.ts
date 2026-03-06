import { onRequest } from "firebase-functions/v2/https";

export const helloWorld = onRequest((req, res) => {
  res.send("Hello from Firebase (Yarn PnP MRE)!");
});
