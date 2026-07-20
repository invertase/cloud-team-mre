import { writeEvalRun } from '../../lib/seed-utils.mjs';

/**
 * Ten support-style questions of the kind an eval set would grade. Each maps to
 * a long, multi-paragraph model answer so every table row is much taller than a
 * viewport, which is what makes the details page hard to navigate.
 */
const CASES = [
  {
    q: 'How do I configure retry and timeout behavior for outbound HTTP calls, and what are the defaults?',
    topic: 'HTTP client retry and timeout configuration',
  },
  {
    q: 'What is the recommended way to paginate a large result set through the public API?',
    topic: 'cursor-based API pagination',
  },
  {
    q: 'How does the caching layer decide when to evict entries under memory pressure?',
    topic: 'cache eviction and memory pressure',
  },
  {
    q: 'Walk me through setting up single sign-on with an external OIDC provider.',
    topic: 'OIDC single sign-on setup',
  },
  {
    q: 'Why are my background jobs occasionally processed twice, and how do I make them idempotent?',
    topic: 'at-least-once delivery and idempotent job handlers',
  },
  {
    q: 'What indexes should I add to speed up this reporting query over the events table?',
    topic: 'database indexing for reporting queries',
  },
  {
    q: 'How do I roll out a schema migration with zero downtime on a live table?',
    topic: 'zero-downtime schema migrations',
  },
  {
    q: 'Explain how rate limiting is applied per tenant and how I can raise a limit.',
    topic: 'per-tenant rate limiting',
  },
  {
    q: 'What is the difference between the streaming and batch ingestion endpoints?',
    topic: 'streaming vs batch ingestion',
  },
  {
    q: 'How do I debug a memory leak in a long-running worker process?',
    topic: 'diagnosing worker memory leaks',
  },
];

/**
 * Build a long, realistic-looking answer of a target size. Answers vary in
 * length (roughly 1.5 KB to 6 KB) so rows are tall and unequal, mimicking real
 * model output where you cannot predict how far to scroll for the next row.
 *
 * @param {string} topic
 * @param {number} paragraphs
 * @returns {string}
 */
function buildAnswer(topic, paragraphs) {
  const intro = `Here is a detailed walkthrough of ${topic}. The short version is that behavior is governed by a small number of configuration values, but the interactions between them are where most confusion comes from, so it is worth going through each one carefully with an example.`;
  const body = Array.from({ length: paragraphs }, (_, i) => {
    const n = i + 1;
    return (
      `Step ${n}. When you are working through ${topic}, the ${n}th thing to ` +
      `check is how the relevant setting is resolved: an explicit value on the ` +
      `request wins over a per-tenant override, which in turn wins over the ` +
      `global default. If none is set, the system falls back to a conservative ` +
      `built-in value chosen to be safe rather than fast. A common mistake here ` +
      `is to set the value in one place and expect it to take effect everywhere, ` +
      `then be surprised when a different code path uses the default instead. To ` +
      `avoid that, log the effective value at startup and assert on it in an ` +
      `integration test so drift is caught early rather than in production.`
    );
  }).join('\n\n');
  const outro = `In summary, for ${topic}, start from the defaults, change one value at a time, and verify the effective configuration rather than the intended one. If you are still seeing unexpected behavior after that, capture a trace of a single request and compare the resolved values against what you expected.`;
  return [intro, body, outro].join('\n\n');
}

const FAITHFULNESS = 'genkitEval/faithfulness';
const RELEVANCY = 'genkitEval/answer_relevancy';
const SAFETY = 'genkitEval/maliciousness';

const metricsMetadata = {
  [FAITHFULNESS]: {
    displayName: 'Faithfulness',
    definition:
      'Measures how well the answer is grounded in the provided context (0-1).',
  },
  [RELEVANCY]: {
    displayName: 'Answer Relevancy',
    definition: 'Measures how relevant the answer is to the question (0-1).',
  },
  [SAFETY]: {
    displayName: 'Maliciousness',
    definition: 'True if the answer contains malicious content.',
  },
};

/**
 * Per-row scores. A few rows are deliberately "interesting" (a failing
 * faithfulness or relevancy score) and buried among passing rows, so the only
 * way to find them on the current details page is to scroll through every
 * multi-KB output.
 */
const SCORES = [
  { faith: 0.95, rel: 0.92 },
  { faith: 0.41, rel: 0.88 }, // low faithfulness, buried in row 2
  { faith: 0.9, rel: 0.94 },
  { faith: 0.88, rel: 0.9 },
  { faith: 0.93, rel: 0.35 }, // low relevancy, buried in row 5
  { faith: 0.91, rel: 0.89 },
  { faith: 0.87, rel: 0.92 },
  { faith: 0.34, rel: 0.9 }, // low faithfulness, buried in row 8
  { faith: 0.9, rel: 0.91 },
  { faith: 0.96, rel: 0.95 },
];

// Vary paragraph counts (hence output height) across rows: 4..13 paragraphs.
const PARAGRAPHS = [7, 12, 4, 9, 13, 5, 8, 11, 6, 10];

export const meta = {
  title: 'Eval details page is unusable for large outputs',
  issue: 'https://github.com/genkit-ai/genkit/issues/4532',
  url: 'http://localhost:4000/evaluate/support-qa',
  steps: [
    'The run "support-qa" has 10 rows (paginated 5 per page); each output is a multi-KB, multi-paragraph answer.',
    'Note the column headers (Input / Reference / Output). Each row\'s grades render as chips (e.g. "Faithfulness : 0.41") at the very bottom of its tall Output cell; there is no metrics summary at the top of the page.',
    'Scroll down to read past the first row.',
    'Expected: stay oriented while scrolling - a pinned/sticky header row (and/or a compact metrics-only summary view with drill-down) so you always know which column is which and can jump straight to the failing rows.',
    'Actual: the column headers scroll off-screen after ~250px while a single page of 5 rows is ~13,000px tall, and there is no summary/metrics-only view, so finding the low-scoring rows (2, 5 and 8) means scrolling through every wall of text hunting for a red chip at the bottom of each Output cell.',
  ],
};

export function seed() {
  const results = CASES.map((c, i) => {
    const s = SCORES[i];
    return {
      testCaseId: `q-${String(i + 1).padStart(2, '0')}`,
      input: c.q,
      output: buildAnswer(c.topic, PARAGRAPHS[i]),
      reference: `A correct, concise answer about ${c.topic}.`,
      metrics: [
        {
          evaluator: FAITHFULNESS,
          score: s.faith,
          status: s.faith >= 0.5 ? 'PASS' : 'FAIL',
          rationale:
            s.faith >= 0.5
              ? 'The answer is grounded in the reference material.'
              : 'Several claims in the answer are not supported by the context.',
        },
        {
          evaluator: RELEVANCY,
          score: s.rel,
          status: s.rel >= 0.5 ? 'PASS' : 'FAIL',
          rationale:
            s.rel >= 0.5
              ? 'The answer addresses the question directly.'
              : 'The answer drifts off-topic and does not address the question.',
        },
        {
          evaluator: SAFETY,
          score: false,
          status: 'PASS',
          rationale: 'No malicious content detected.',
        },
      ],
    };
  });

  writeEvalRun({
    evalRunId: 'support-qa',
    datasetId: 'support-qa-dataset',
    results,
    metricsMetadata,
  });
}
