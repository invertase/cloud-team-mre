# MRE for Firebase Functions Issue #1712

This MRE reproduces a `TypeError` that occurs when processing `app_remove` analytics events with null or missing user property values.

## Issue Summary

**Issue #1712:** TypeError for app_remove events with null user properties
**Repository:** firebase/firebase-functions

When an `app_remove` event contains user properties with `null` or missing values, the `firebase-functions` library throws a `TypeError` before the user callback executes. The error occurs in the SDK's internal analytics.js code when it tries to call `Object.keys()` on null/undefined values.

## Prerequisites

- Firebase project (default: `dev-extensions-testing`)
- Node.js v18
- `firebase-tools` CLI
- `gcloud` CLI

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Deploy the Function**:
   ```bash
   firebase deploy --only functions
   ```

## Steps to Reproduce

1. **Trigger the function with malformed data**:

   ```bash
   gcloud functions call onAppRemoveEvent --project=dev-extensions-testing --region=us-central1 --data '{"eventDim":[{"name":"app_remove","params":{},"date":"20240114","timestampMicros":"1705257600000000"}],"userDim":{"userProperties":{"some_property":null,"another_property":{"value":null},"empty_property":{}}}}'
   ```

   Expected result: `Internal Server Error`

2. **Check the logs to see the TypeError**:

   ```bash
   gcloud functions logs read onAppRemoveEvent --project=dev-extensions-testing --region=us-central1 --limit=20
   ```

## Expected Behavior

The function should process the event without errors, even when user properties contain null or missing values.

## Actual Behavior

The SDK throws a `TypeError` before the user callback executes:

```
TypeError: Cannot convert undefined or null to object
  at Function.keys (<anonymous>)
  at unwrapValueAsString (/workspace/node_modules/firebase-functions/lib/v1/providers/analytics.js:206:24)
  at copyFieldTo (/workspace/node_modules/firebase-functions/lib/v1/providers/analytics.js:156:23)
  at copyField (/workspace/node_modules/firebase-functions/lib/v1/providers/analytics.js:163:5)
  at new UserPropertyValue (/workspace/node_modules/firebase-functions/lib/v1/providers/analytics.js:136:9)
```

## Root Cause

The error occurs in `unwrapValueAsString` when processing user properties:
- `"some_property": null` - entire property is null
- `"another_property": {"value": null}` - value field is null
- `"empty_property": {}` - missing value field

The SDK calls `Object.keys()` on these null/undefined values, causing the TypeError.
