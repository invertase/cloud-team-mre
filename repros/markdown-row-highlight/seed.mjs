import { writeDataset } from '../../lib/seed-utils.mjs';

const MARKDOWN_INPUT = [
  '# Heading',
  '',
  'Some prose before a fenced code block:',
  '',
  '```js',
  "console.log('hello world');",
  '```',
  '',
  'Trailing prose after the code block.',
].join('\n');

export const meta = {
  title: 'Markdown code blocks punch a hole in the dataset row hover highlight',
  issue: 'https://github.com/genkit-ai/genkit/issues/4532',
  url: 'http://localhost:4000/datasets/markdown-dataset',
  steps: [
    'Hover the first example row (its input contains a fenced code block).',
    'Expected: the hover highlight tints the entire row uniformly.',
    'Actual: the rendered code block paints its own opaque background over the highlight, leaving a visible hole in the row tint.',
  ],
};

export function seed() {
  writeDataset({
    datasetId: 'markdown-dataset',
    examples: [
      { input: MARKDOWN_INPUT, reference: 'Plain reference output' },
      { input: 'A plain-text example for comparison', reference: 'Reference' },
    ],
  });
}
