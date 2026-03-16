import { onRequest } from "firebase-functions/https";
import { defineSecret } from "firebase-functions/params";

const secretValue = defineSecret("functions-webhook-secret");
const projectId = "dev-extensions-testing";

export const mailjetWebhook = onRequest(
  {
    region: "europe-west1",
    invoker: "public",
    secrets: [secretValue],
    serviceAccount: `function@${projectId}.iam.gserviceaccount.com`,
  },
  async (_req, res) => {
    console.log(secretValue.value());
    res.status(200).send();
  }
);
