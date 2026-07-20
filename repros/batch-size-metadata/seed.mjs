import { writeDataset } from '../../lib/seed-utils.mjs';

export const meta = {
  title: 'Batch size is not part of the eval run metadata',
  issue: 'https://github.com/genkit-ai/genkit/issues/3263',
  url: 'http://localhost:4000/datasets/batch-dataset',
  steps: [
    'This repro is observed by running an eval and inspecting a file, not by a UI-only interaction: batchSize is dropped at eval-run WRITE time, so no seed can fake it.',
    'In a second terminal (leave this dev server running), run an eval WITH a batch size against the seeded dataset: npx genkit eval:flow echoFlow --input batch-dataset --batchSize 2 --force',
    'Copy the <runId> from the printed "View the evaluation results at .../evaluate/<runId>" line.',
    'Inspect the persisted run metadata: cat .genkit/evals/<runId>.json | python3 -c "import json,sys; print(list(json.load(sys.stdin)[\'key\'].keys()))"',
    'Expected: the key records the batch size the run used (e.g. a batchSize field), so the Dev UI eval details page can show it.',
    'Actual: the key only has evalRunId/createdAt/metricSummaries/metricsMetadata/actionRef/datasetId/datasetVersion - no batchSize. Confirm it is absent everywhere the UI reads: grep -ri batchSize .genkit/evals/ returns nothing (batchSize appears only inside .genkit/traces/, in the evaluator action input, never in the eval store).',
  ],
};

export function seed() {
  writeDataset({
    datasetId: 'batch-dataset',
    examples: [
      { input: 'one' },
      { input: 'two' },
      { input: 'three' },
      { input: 'four' },
    ],
  });
}
