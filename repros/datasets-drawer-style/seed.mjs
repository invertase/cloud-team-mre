import { writeDataset } from '../../lib/seed-utils.mjs';

export const meta = {
  title: 'Datasets drawer header diverges from the shared drawer treatment',
  issue: 'https://github.com/genkit-ai/genkit/issues/4532',
  url: 'http://localhost:4000/datasets/drawer-dataset',
  steps: [
    'Click "Add example" to open the datasets drawer.',
    'Compare its header with any other Dev UI drawer (e.g. the trace side panel).',
    'Expected: title first, close button last with an accessible label, standard header height/border/background.',
    'Actual: the close button renders before the title, has no aria-label, and the header lacks the shared treatment.',
  ],
};

export function seed() {
  writeDataset({
    datasetId: 'drawer-dataset',
    examples: [{ input: 'Example input', reference: 'Reference output' }],
  });
}
