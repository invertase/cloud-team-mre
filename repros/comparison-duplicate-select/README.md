# The same eval run can be selected in multiple comparison slots

Issue: https://github.com/genkit-ai/genkit/issues/4532 (UI/UX item 2)

```bash
pnpm repro comparison-duplicate-select
# open http://localhost:4000/datasets/cmp-dataset/evaluate/baseline--vs--run-two
```

Three eval runs are seeded on one dataset. The URL opens the eval details page
comparing `baseline` against `run-two`.

1. Click **+ Comparison** to add a second comparison slot.
2. Open the new slot's **Select** dropdown.

- **Expected:** `run-two` is disabled, since it is already shown in the first
  comparison column.
- **Actual:** only the baseline is disabled; `run-two` is selectable again and
  the table renders the same run in two comparison columns.

Last verified against: `genkit-cli` 1.36.x
