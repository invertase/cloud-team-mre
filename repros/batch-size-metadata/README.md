# Batch size is not part of the eval run metadata

Issue: https://github.com/genkit-ai/genkit/issues/3263
(follow-up to https://github.com/genkit-ai/genkit/issues/1857 point 3)

Unlike the other repros in this repo, this one cannot be demonstrated by a
seeded `.genkit/` state file. The bug is about metadata **written at eval-run
time** by the tools backend: when you run an evaluation with a `batchSize`, that
value is used to batch the work but is never stored on the eval run, so the Dev
UI has nothing to display. A seed can only write whatever fields we choose, so
it cannot prove the field is *dropped*. You have to run a real eval and inspect
what gets persisted.

```bash
pnpm repro batch-size-metadata
# leaves the dev server running on http://localhost:4000 and seeds a dataset
# named "batch-dataset"

# In a SECOND terminal, from the repo root, run an eval WITH a batch size:
npx genkit eval:flow echoFlow --input batch-dataset --batchSize 2 --force
# -> prints: View the evaluation results at: http://localhost:4000/evaluate/<runId>

# Inspect the persisted run metadata (the "key" the Dev UI reads):
cat .genkit/evals/<runId>.json \
  | python3 -c "import json,sys; print(list(json.load(sys.stdin)['key'].keys()))"
```

- **Expected:** the persisted eval run key records the batch size the run used
  (e.g. a `batchSize` field), so the eval details page can show which batch size
  produced the results.
- **Actual:** the key is
  `['evalRunId', 'createdAt', 'metricSummaries', 'metricsMetadata', 'actionRef', 'datasetId', 'datasetVersion']`
  - no `batchSize`. The value reaches the evaluator (you can see
  `"batchSize":2` inside the evaluator action input under `.genkit/traces/`) but
  is never written to the eval store:

  ```bash
  grep -ri batchSize .genkit/evals/   # -> no matches
  grep -rl batchSize .genkit/traces/  # -> matches (runtime only, not persisted metadata)
  ```

The gap is in the released `EvalRunKeySchema`
(`@genkit-ai/tools-common`), which has no `batchSize` field, so there is nowhere
for the eval store or the Dev UI eval details page to surface it.

Last verified against: `genkit-cli` 1.39.0
