import * as fs from 'node:fs';
import * as path from 'node:path';

const GENKIT_DIR = path.resolve(process.cwd(), '.genkit');

function readIndex(indexPath) {
  if (!fs.existsSync(indexPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * Derive the per-evaluator `metricSummaries` from the per-row metrics, mirroring
 * `extractMetricSummaries` in `@genkit-ai/tools-common` so the seeded summary
 * matches what the Dev UI would render for a real run. Numeric evaluators get an
 * `averageScore`; boolean/string evaluators get a `scoreDistribution`.
 *
 * @param {Array<{ metrics?: Array<{ evaluator: string, score?: unknown, status?: string, error?: string }> }>} results
 * @returns {Array<Record<string, unknown>>}
 */
function deriveMetricSummaries(results) {
  const byEvaluator = new Map();
  for (const r of results) {
    for (const m of r.metrics ?? []) {
      if (!byEvaluator.has(m.evaluator)) byEvaluator.set(m.evaluator, []);
      byEvaluator.get(m.evaluator).push(m);
    }
  }

  const countBy = (items, get) => {
    const out = {};
    for (const it of items) {
      const k = String(get(it));
      out[k] = (out[k] ?? 0) + 1;
    }
    return out;
  };

  return [...byEvaluator.entries()].map(([evaluator, items]) => {
    const defined = items.filter((it) => typeof it.score !== 'undefined');
    const base = {
      evaluator,
      testCaseCount: items.length,
      errorCount: items.filter((it) => it.error !== undefined).length,
      scoreUndefinedCount: items.length - defined.length,
      statusDistribution: countBy(items, (it) => it.status),
    };
    if (defined.length === 0) return base;
    const scoreType = typeof defined[0].score;
    if (scoreType === 'number') {
      const avg =
        defined.reduce((sum, it) => sum + it.score, 0) / defined.length;
      return { ...base, averageScore: avg };
    }
    return { ...base, scoreDistribution: countBy(defined, (it) => it.score) };
  });
}

/**
 * Write an eval run into the local file eval store
 * (.genkit/evals/index.json + .genkit/evals/<evalRunId>.json).
 *
 * Each result accepts `input`, `output` and an optional `reference` (the
 * expected value). When `reference` is present the Dev UI exposes the
 * output-vs-reference diff toggle for that row.
 *
 * Note: the Dev UI derives run display names from the first characters of the
 * evalRunId, so use short, readable, distinct IDs.
 *
 * Each result may carry `metrics` (`[{ evaluator, score, status, rationale }]`);
 * pass `metricsMetadata` (`{ [evaluator]: { displayName, definition } }`) to
 * label the evaluators. When any result has metrics, the run's
 * `metricSummaries` are derived automatically.
 *
 * @param {{
 *   evalRunId: string,
 *   datasetId: string,
 *   results: Array<{ testCaseId?: string, input: unknown, output: unknown, reference?: unknown, metrics?: Array<{ evaluator: string, score?: unknown, status?: string, rationale?: string }> }>,
 *   metricsMetadata?: Record<string, { displayName: string, definition: string }>,
 * }} params
 */
export function writeEvalRun({
  evalRunId,
  datasetId,
  results,
  metricsMetadata,
}) {
  const evalsDir = path.join(GENKIT_DIR, 'evals');
  fs.mkdirSync(evalsDir, { recursive: true });

  const key = {
    actionRef: 'flow/echoFlow',
    datasetId,
    datasetVersion: 1,
    evalRunId,
    createdAt: new Date().toISOString(),
    metricSummaries: deriveMetricSummaries(results),
    ...(metricsMetadata ? { metricsMetadata } : {}),
  };

  const indexPath = path.join(evalsDir, 'index.json');
  const index = readIndex(indexPath);
  index[evalRunId] = key;
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

  fs.writeFileSync(
    path.join(evalsDir, `${evalRunId}.json`),
    JSON.stringify({
      key,
      results: results.map((r, i) => ({
        testCaseId: r.testCaseId ?? `case-${i + 1}`,
        input: r.input,
        output: r.output,
        // Optional expected value; only emitted when supplied so existing seeds
        // (which never set it) keep producing identical output. Its presence is
        // what makes the Dev UI's output-vs-reference diff toggle available.
        ...(r.reference !== undefined ? { reference: r.reference } : {}),
        context: [],
        traceIds: [],
        metrics: r.metrics ?? [],
      })),
      ...(metricsMetadata ? { metricsMetadata } : {}),
    })
  );
}

/**
 * Write a dataset into the local file dataset store
 * (.genkit/datasets/index.json + .genkit/datasets/<datasetId>.json).
 */
export function writeDataset({ datasetId, examples }) {
  const datasetsDir = path.join(GENKIT_DIR, 'datasets');
  fs.mkdirSync(datasetsDir, { recursive: true });

  const now = new Date().toString();
  const indexPath = path.join(datasetsDir, 'index.json');
  const index = readIndex(indexPath);
  index[datasetId] = {
    datasetId,
    size: examples.length,
    datasetType: 'UNKNOWN',
    metricRefs: [],
    version: 1,
    createTime: now,
    updateTime: now,
  };
  fs.writeFileSync(indexPath, JSON.stringify(index));

  fs.writeFileSync(
    path.join(datasetsDir, `${datasetId}.json`),
    JSON.stringify(
      examples.map((e, i) => ({
        testCaseId: e.testCaseId ?? `case-${i + 1}`,
        ...e,
      }))
    )
  );
}
