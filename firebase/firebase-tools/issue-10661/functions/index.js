import { onRequest } from "firebase-functions/v2/https";

const deployMarker = "issue-10661 baseline";

export const ping = onRequest((_request, response) => {
  response.status(200).send(deployMarker);
});
