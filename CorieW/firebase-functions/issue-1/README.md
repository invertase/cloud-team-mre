# firebase-functions issue #1 MRE

Issue: https://github.com/CorieW/firebase-functions/issues/1

## Setup

```bash
npm install
```

## Reproduce

```bash
npm run typecheck
```

## Expected behavior

`onMessagePublished({ topic: defineString("some-topic") }, handler)` should type-check.

## Actual behavior

TypeScript reports `TS2769` because `PubSubOptions.topic` is typed as `string` in `firebase-functions`.
