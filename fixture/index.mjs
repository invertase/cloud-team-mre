import { genkit, z } from 'genkit';

const ai = genkit({});

/**
 * A no-op echo model so the Dev UI has an app to attach to. No API key or
 * network access required; repros only need the dev server's local stores.
 */
ai.defineModel(
  {
    name: 'test/echo',
    label: 'Test Echo Model',
    supports: { multiturn: true, systemRole: true },
  },
  async (request) => {
    const lastUserMessage = [...request.messages]
      .reverse()
      .find((m) => m.role === 'user');
    const text =
      lastUserMessage?.content.map((p) => p.text ?? '').join('') ?? '';
    return { message: { role: 'model', content: [{ text: `echo: ${text}` }] } };
  }
);

ai.defineFlow(
  {
    name: 'echoFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (input) => `echo: ${input}`
);
