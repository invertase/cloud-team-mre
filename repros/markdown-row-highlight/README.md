# Markdown code blocks punch a hole in the dataset row hover highlight

Issue: https://github.com/genkit-ai/genkit/issues/4532 (UI/UX item 5)

```bash
pnpm repro markdown-row-highlight
# open http://localhost:4000/datasets/markdown-dataset
```

The seeded dataset has one example whose input contains a fenced code block and
one plain-text example for comparison.

1. Hover each row in the examples table.

- **Expected:** the hover highlight tints the whole row uniformly (as on the
  plain-text row).
- **Actual:** on the markdown row, the rendered code block paints an opaque
  background on top of the semi-transparent row highlight, punching a visible
  hole in it.

Last verified against: `genkit-cli` 1.36.x
