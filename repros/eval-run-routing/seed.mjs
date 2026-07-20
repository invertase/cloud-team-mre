import { writeEvalRun } from '../../lib/seed-utils.mjs';

export const meta = {
  title: 'Clicking an eval run on the Evaluations page routes into the Datasets section',
  issue: 'https://github.com/genkit-ai/genkit/issues/4532',
  url: 'http://localhost:4000/evaluate',
  steps: [
    'Note the left-nav "Evaluations" item is highlighted.',
    'In the runs table, click the "route-one" row.',
    'Expected: you stay in the Evaluations section (nav highlight stays on "Evaluations", URL stays under /evaluate).',
    'Actual: the URL becomes /datasets/route-dataset/evaluate/route-one and the left-nav highlight jumps to "Datasets".',
  ],
};

export function seed() {
  for (const [i, evalRunId] of ['route-one', 'route-two'].entries()) {
    writeEvalRun({
      evalRunId,
      datasetId: 'route-dataset',
      results: [{ input: `input ${i + 1}`, output: `output ${i + 1}` }],
    });
  }
}
