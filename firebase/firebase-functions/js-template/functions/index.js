import { onCallGenkit } from "firebase-functions/v2/https";
import { requiresRole } from "firebase-functions/v2";
import { genkit, z } from "genkit";

requiresRole("roles/bigquery.dataViewer");

const ai = genkit({});
const echo = ai.defineFlow(
  { name: "echo", inputSchema: z.string(), outputSchema: z.string() },
  async (s) => s,
);

export const echoFlow = onCallGenkit(echo);
