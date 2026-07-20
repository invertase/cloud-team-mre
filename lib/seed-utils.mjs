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
 * Write an eval run into the local file eval store
 * (.genkit/evals/index.json + .genkit/evals/<evalRunId>.json).
 *
 * Each result accepts `input`, `output` and an optional `reference` (the
 * expected value). When `reference` is present the Dev UI exposes the
 * output-vs-reference diff toggle for that row.
 *
 * Note: the Dev UI derives run display names from the first characters of the
 * evalRunId, so use short, readable, distinct IDs.
 */
export function writeEvalRun({ evalRunId, datasetId, results }) {
  const evalsDir = path.join(GENKIT_DIR, 'evals');
  fs.mkdirSync(evalsDir, { recursive: true });

  const key = {
    actionRef: 'flow/echoFlow',
    datasetId,
    datasetVersion: 1,
    evalRunId,
    createdAt: new Date().toISOString(),
    metricSummaries: [],
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
        metrics: [],
      })),
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
