import { genkit, z } from 'genkit';
import { echoModel } from 'genkit/testing';

const ai = genkit({});

/**
 * Deterministic echo model from genkit's public testing module, so the Dev UI
 * has an app to attach to. No API key or network access required; repros only
 * need the dev server's local stores.
 */
echoModel(ai);

ai.defineFlow(
  {
    name: 'echoFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (input) => `echo: ${input}`
);

/**
 * A trivial deterministic evaluator so `genkit eval:run --batchSize <n>` has an
 * evaluator to invoke. It scores every test case identically (PASS), so eval
 * runs are fully reproducible and require no API keys or network access.
 */
ai.defineEvaluator(
  {
    name: 'test/always_pass',
    displayName: 'Always Pass',
    definition: 'Deterministically returns a PASS score of 1 for every case.',
  },
  async (datapoint) => {
    return {
      testCaseId: datapoint.testCaseId,
      evaluation: { score: 1, status: 'PASS' },
    };
  }
);
