# MRE for firebase-functions issue #1715

## Issue Summary

A warning about using `.value()` is shown whenever an expression is used in the `cors` option of an `onCall` function.

## Prerequisites

- Node.js v22.17.1
- Firebase CLI v14.11.1

## Setup

1. `npm install`
2. `firebase use <project_id>`

## Steps to Reproduce

1. `npm run build`
2. `firebase deploy --only functions`

## Expected vs Actual Behavior

### Expected

The function deploys without any warnings.

### Actual

A warning is logged to the console:

```
{"severity":"WARNING","message":"params.PROJECT_ID == \"something\" ? [\"http://localhost:5173\"] : [].value() invoked during function deployment, instead of during runtime."}
{"severity":"WARNING","message":"This is usually a mistake. In configs, use Params directly without calling .value()."}

{"severity":"WARNING","message":"example: { memory: memoryParam } not { memory: memoryParam.value() }"}
```

## Error Messages

See actual behavior.