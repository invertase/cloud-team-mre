import { writeEvalRun } from '../../lib/seed-utils.mjs';

export const meta = {
  title: 'The same eval run can be selected in multiple comparison slots',
  issue: 'https://github.com/genkit-ai/genkit/issues/4532',
  url: 'http://localhost:4000/datasets/cmp-dataset/evaluate/baseline--vs--run-two',
  steps: [
    'The page opens comparing "baseline" against "run-two".',
    'Click the "+ Comparison" button to add a second comparison slot.',
    'Open the new slot\'s "Select" dropdown.',
    'Expected: "run-two" is disabled (it is already shown in the first comparison column).',
    'Actual: only the baseline is disabled; "run-two" can be selected again, producing duplicate comparison columns.',
  ],
};

export function seed() {
  for (const [i, evalRunId] of ['baseline', 'run-two', 'run-three'].entries()) {
    writeEvalRun({
      evalRunId,
      datasetId: 'cmp-dataset',
      results: [{ input: `input ${i + 1}`, output: `output ${i + 1}` }],
    });
  }
}
