import { writeEvalRun } from '../../lib/seed-utils.mjs';

/**
 * Approximate size, in kilobytes, of the generated output/reference strings.
 * Override with DIFF_SIZE_KB to calibrate the freeze against a given machine.
 */
const SIZE_KB = Number(process.env.DIFF_SIZE_KB ?? 300);

const WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod ' +
  'tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam ' +
  'quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo ' +
  'consequat duis aute irure reprehenderit voluptate velit esse cillum ' +
  'fugiat nulla pariatur excepteur sint occaecat cupidatat non proident'
).split(' ');

/** Deterministic PRNG so seeded runs are byte-for-byte reproducible. */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate an array of pseudo-random lorem words totalling ~sizeKb of text. */
function generateWords(sizeKb, seed) {
  const rand = mulberry32(seed);
  const target = sizeKb * 1024;
  const words = [];
  let length = 0;
  while (length < target) {
    const word = WORDS[Math.floor(rand() * WORDS.length)];
    words.push(word);
    length += word.length + 1;
  }
  return words;
}

/**
 * The reference is the output with ~8% of its words mutated. Scattered edits
 * are the expensive case for a line/character diff, so the render-path diff has
 * the most work to do here.
 */
function mutate(words, seed) {
  const rand = mulberry32(seed);
  return words.map((w) =>
    rand() < 0.08 ? WORDS[Math.floor(rand() * WORDS.length)] : w
  );
}

const outputWords = generateWords(SIZE_KB, 1);
const OUTPUT = outputWords.join(' ');
const REFERENCE = mutate(outputWords, 2).join(' ');

export const meta = {
  title: 'Eval details diff view freezes on large outputs',
  issue: 'https://github.com/genkit-ai/genkit/issues/4532',
  url: 'http://localhost:4000/evaluate/diff-freeze',
  steps: [
    'Open the eval run and expand row 1 (its output and reference are each ~300KB of text).',
    'Toggle the diff view on for that row (the toggle is available because the row has reference data).',
    'Expected: the diff renders within a few hundred milliseconds and the tab stays responsive.',
    'Actual: the tab freezes for several seconds - scrolling and clicks do nothing - because the diff is computed synchronously over the large strings on the render path.',
  ],
};

export function seed() {
  writeEvalRun({
    evalRunId: 'diff-freeze',
    datasetId: 'diff-freeze-dataset',
    results: [{ input: 'Summarize the document.', output: OUTPUT, reference: REFERENCE }],
  });
}
