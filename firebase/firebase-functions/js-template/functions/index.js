import { onCallGenkit } from "firebase-functions/v2/https";
  import { genkit, z } from "genkit";

  const ai = genkit({});

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const reproduceDisconnectBlindness = ai.defineFlow(
    {
      name: "demo",
      inputSchema: z.object({
        prompt: z.string(),
        totalSteps: z.number().optional(),
        stepDelayMs: z.number().optional(),
      }),
      streamSchema: z.object({
        step: z.number(),
        message: z.string(),
      }),
    },
    async (input, { sendChunk, context }) => {
      const totalSteps = input.totalSteps ?? 30;
      const stepDelayMs = input.stepDelayMs ?? 2000;

      const rawRequest = context.rawRequest;
      const signal = context.signal;

      console.log("[issue1888] flow started", {
        prompt: input.prompt,
        totalSteps,
        stepDelayMs,
        hasRawRequest: rawRequest !== undefined,
        hasSignal: signal !== undefined,
        contextKeys: Object.keys(context ?? {}),
      });

      console.log("[issue1888] rawRequest?", rawRequest);
      console.log("[issue1888] response signal?", signal);

      if (signal && typeof signal.addEventListener === "function") {
        signal.addEventListener("abort", () => {
          console.log("[issue1888] abort signal fired inside flow");
        });
      } else {
        console.log("[issue1888] no abort signal available inside flow context");
      }

      for (let step = 1; step <= totalSteps; step++) {
        console.log(`[issue1888] before silent work step=${step}`);
        await sleep(stepDelayMs);
        console.log(`[issue1888] after silent work step=${step}`);

        const chunk = {
          step,
          message: `completed step ${step} for prompt=${input.prompt}`,
        };

        try {
          const wrote = await sendChunk(chunk);
          console.log(`[issue1888] sendChunk step=${step} wrote=${wrote}`);
        } catch (err) {
          console.error(`[issue1888] sendChunk failed at step=${step}`, err);
          throw err;
        }
      }

      console.log("[issue1888] flow finished normally");
      return {
        done: true,
        totalSteps,
        stepDelayMs,
      };
    }
  );

  export const issue1888 = onCallGenkit(reproduceDisconnectBlindness);