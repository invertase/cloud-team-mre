# CorieW/firebase-functions issue #1

Issue URL: https://github.com/CorieW/firebase-functions/issues/1

## Summary

This MRE reproduces a TypeScript type mismatch for `onMessagePublished` when `topic` is provided as a `StringParam` from `defineString`.

## Variants

- `reported-versions`: Uses the issue-reported package version (`firebase-functions@7.0.1`)
- `current-versions`: Uses the current package line (`firebase-functions@^7.2.2`)

## Prerequisites

- Node.js (issue reported with `v20.10.0`)

## Steps to Reproduce

### Reported Versions

1. `cd CorieW/firebase-functions/issue-1/reported-versions`
2. `npm install`
3. `npm run build`

### Current Versions

1. `cd CorieW/firebase-functions/issue-1/current-versions`
2. `npm install`
3. `npm run build`

## Expected Behavior

`onMessagePublished` accepts a parameterized topic and compiles.

## Actual Behavior

TypeScript reports `TS2769` because `PubSubOptions.topic` is typed as `string`, rejecting `StringParam`.
