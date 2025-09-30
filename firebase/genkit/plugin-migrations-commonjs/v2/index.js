const { genkit } = require('genkit');
const { googleAI, vertexAI } = require('@genkit-ai/google-genai');

const ai = genkit({
  plugins: [
    googleAI({
      models: ['gemini-1.5-flash'],
    }),
    vertexAI({
      models: ['gemini-1.5-flash'],
    }),
  ],
});

// Basic health check endpoint
ai.defineFlow({
  name: 'v2_healthCheck',
  output: {
    status: 'string',
    version: 'string',
    timestamp: 'string',
  }
}, async () => {
  return {
    status: 'healthy',
    version: 'v2',
    timestamp: new Date().toISOString(),
  };
});

// Sample generation flow
ai.defineFlow({
  name: 'v2_generateText',
  input: {
    prompt: 'string',
  },
  output: {
    text: 'string',
    version: 'string',
  }
}, async ({ prompt }) => {
  const { text } = await ai.generate({
    model: 'gemini-1.5-flash',
    prompt,
  });

  return {
    text,
    version: 'v2',
  };
});

module.exports = ai;