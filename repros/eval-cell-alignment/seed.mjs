import { writeEvalRun } from '../../lib/seed-utils.mjs';

const LARGE_OUTPUT = Array.from(
  { length: 40 },
  (_, i) =>
    `Paragraph ${i + 1}: This is a deliberately long line of eval output text ` +
    `used to make this table row much taller than its small input cell so that ` +
    `vertical alignment between the input and output columns can be seen.`
).join('\n\n');

export const meta = {
  title: 'Eval details cells are not top-aligned',
  issue: 'https://github.com/genkit-ai/genkit/issues/4532',
  url: 'http://localhost:4000/evaluate/align-run',
  steps: [
    'Look at row 1: the output is 40 paragraphs tall, the input is one word.',
    'Expected: the input "Hi" starts on the same line as the first output paragraph.',
    'Actual: the input is vertically centered, rendering ~1400px below the output start; the input column looks empty.',
  ],
};

export function seed() {
  writeEvalRun({
    evalRunId: 'align-run',
    datasetId: 'align-dataset',
    results: [{ input: 'Hi', output: LARGE_OUTPUT }],
  });
}
