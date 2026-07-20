import { writeDataset } from '../../lib/seed-utils.mjs';

export const meta = {
  title: 'Delete-dataset dialog closes on error',
  issue: 'https://github.com/genkit-ai/genkit/issues/4415',
  url: 'http://localhost:4000/datasets/doomed-dataset',
  steps: [
    'Force the delete to fail before confirming, e.g. in another terminal: chmod 444 .genkit/datasets/index.json',
    'In the UI, delete the dataset and confirm in the dialog.',
    'Expected: the dialog stays open and shows the error, so you have context to retry.',
    'Actual: the dialog closes immediately regardless; the only feedback is a "Error deleting dataset" snackbar.',
    'Cleanup: chmod 644 .genkit/datasets/index.json',
  ],
};

export function seed() {
  writeDataset({
    datasetId: 'doomed-dataset',
    examples: [{ input: 'Example input', reference: 'Reference output' }],
  });
}
