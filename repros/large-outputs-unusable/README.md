# Eval details page is unusable for large outputs

Issue: https://github.com/genkit-ai/genkit/issues/4532 (UI/UX item 4)

```bash
pnpm repro large-outputs-unusable
# open http://localhost:4000/evaluate/support-qa
```

The seeded run `support-qa` has 10 graded rows (paginated 5 per page). Each row
is a realistic support-style question with a multi-KB, multi-paragraph model
answer (outputs range ~3 KB to ~9 KB, deliberately of varying length). Every row
is graded by three evaluators - Faithfulness, Answer Relevancy and Maliciousness
- and rows 2, 5 and 8 have a failing score buried among the passing ones.

This is a usability gap, not a crash: with large outputs the details page gives
you nothing to stay oriented against.

- **Expected:** you stay oriented while scrolling. The column header row stays
  pinned (sticky) so you always know which column is which, and/or the page
  offers a compact metrics-only summary view (per-evaluator pass/fail counts and
  average score) with drill-down, so you can jump straight to the interesting
  rows without reading every output.
- **Actual:**
  - The `Input / Reference / Output` header row is `position: static` inside the
    scrolling `main.content-area`, so it scrolls out of view after ~250 px -
    before you have even finished reading the first row's output (row 1's output
    alone is ~2,300 px tall; a single page of 5 rows is ~13,000 px tall). Past
    that point nothing labels the columns.
  - There is no metrics-only / summary view. The only view toggles are
    **Preview** (the walls of text) and **JSON** (raw), plus a diff toggle. Each
    row's grades render as chips (e.g. `Faithfulness : 0.41`) at the *bottom* of
    its tall Output cell, so the only way to find the failing rows is to scroll
    through every output hunting for a red chip. The aggregate the run already
    stores (`metricSummaries`: average score and PASS/FAIL distribution per
    evaluator) is never surfaced on this page.

## What to check quickly

- Scroll the page down a little and watch the `Input / Reference / Output`
  header disappear; there is nothing to re-orient you.
- Confirm there is no "summary" or "metrics only" toggle next to Preview / JSON,
  and that the per-row scores only appear at the bottom of each Output cell.

Related: `eval-cell-alignment` (same page, the empty-looking Input/Reference
columns you see here are that bug) and the sibling diff-view-freeze repro (large
outputs in the **comparison** view). This repro shares the seed helper
(`writeEvalRun`, now with metrics support) with those.

Last verified against: `genkit-cli` 1.39.0
