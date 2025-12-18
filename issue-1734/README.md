# Issue #1734 MRE: onSchedule() with string parameter creates incorrect v1 URLs

## Description

This MRE reproduces a bug where `onSchedule()` with a string parameter creates Cloud Scheduler jobs with incorrect v1 URLs instead of v2 Cloud Run URLs, causing `PERMISSION_DENIED` errors.

## Environment

- **firebase-functions:** 6.4.0
- **firebase-tools:** 14.16.0
- **Platform:** macOS (Darwin 25.0.0)
- **Node.js:** 20

## Problem

The TypeScript types allow both signatures:
- `onSchedule(schedule: string, handler: Function)`
- `onSchedule(options: ScheduleOptions, handler: Function)`

However, only the object syntax properly configures the Cloud Scheduler job with the correct Cloud Run URL.

### Expected Behavior

Both syntaxes should create Cloud Scheduler jobs with the correct v2 Cloud Run URLs (format: `https://FUNCTION_NAME-HASH-uc.a.run.app/`)

### Actual Behavior

When using the string parameter syntax, Cloud Scheduler jobs are created with v1 function URLs that don't exist:
- URL format: `https://us-central1-PROJECT.cloudfunctions.net/FUNCTION_NAME` (v1 format)
- Function execution fails with `PERMISSION_DENIED`

## Test Case

The `functions/index.ts` file contains both examples:

1. **failingScheduler** - Uses string syntax (FAILS)
   ```typescript
   export const failingScheduler = onSchedule(
     "every 1 minutes",
     async () => {
       console.log("This function gets PERMISSION_DENIED");
     }
   );
   ```

2. **workingScheduler** - Uses object syntax (WORKS)
   ```typescript
   export const workingScheduler = onSchedule(
     {
       schedule: "every 1 minutes",
       timeZone: "America/Los_Angeles",
     },
     async () => {
       console.log("This function works correctly");
     }
   );
   ```
