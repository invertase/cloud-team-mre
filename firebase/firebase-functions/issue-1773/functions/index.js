import { https, params } from "firebase-functions";

export const allowedOrigins = params.defineList('ALLOWED_ORIGINS');

export const issue1773 = https.onRequest(
  { cors: allowedOrigins },
  async (request, response) => {
    response.send('Hello there!');
  }
);