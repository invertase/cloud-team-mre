# Genkit Dev UI repros

Minimal reproducible examples for bugs in the Genkit Dev UI, runnable by anyone
against the released `genkit-cli`.

**Ground rule: this branch never contains Genkit Dev UI source code** (it is
closed source). Each repro drives the Dev UI that ships inside the public
`genkit-cli` package, using:

- a tiny fixture Genkit app (`fixture/index.mjs`) with a no-op echo model, so no
  API keys or network calls are needed, and
- seeded `.genkit/` state files (eval runs, datasets) written directly to disk
  in the format the local file stores read.

## Usage

```bash
pnpm install
pnpm repro <slug>
```

This seeds the state for that repro, starts the Genkit dev server, and prints
the URL plus the steps to observe the bug. Each repro also has its own README
with the steps, the expected vs actual behavior, and a link to the upstream
issue.

| Slug | Bug | Issue |
| --- | --- | --- |
| `eval-cell-alignment` | Eval details cells are not top-aligned; a small input next to a large output renders far below it | genkit-ai/genkit#4532 |
| `comparison-duplicate-select` | The same eval run can be selected in multiple comparison slots | genkit-ai/genkit#4532 |
| `markdown-row-highlight` | Markdown code blocks punch a hole in the dataset row hover highlight | genkit-ai/genkit#4532 |
| `datasets-drawer-style` | Datasets drawer header diverges from the shared drawer treatment (close button first, no aria-label) | genkit-ai/genkit#4532 |
| `delete-dataset-error` | Delete-dataset dialog closes on error, leaving only a context-free snackbar | genkit-ai/genkit#4415 |
| `eval-run-routing` | Clicking an eval run on the Evaluations page routes into the Datasets section (URL and left-nav highlight jump to Datasets) | genkit-ai/genkit#4532 |
| `batch-size-metadata` | Eval runs with a `--batchSize` don't record it in the persisted eval metadata, so the Dev UI can't show which batch size was used | genkit-ai/genkit#3263 |

## Caveats

- The `.genkit/` on-disk formats are undocumented internals of
  `@genkit-ai/tools-common`; the pinned `genkit-cli` version in `package.json`
  is the version these seeds are known to work against.
- Repros target the released CLI. A bug fixed on the Dev UI's main branch still
  reproduces here until the fix ships in a CLI release; each repro README
  records the last version it was verified against.

## Resetting

`pnpm clean` removes the local `.genkit/` state so repros start fresh.
