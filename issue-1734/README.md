# Firebase Issue #1734 - onSchedule String Parameter Bug

This MRE demonstrates a bug where `onSchedule()` with a string parameter creates Cloud Scheduler jobs with incorrect v1 URLs instead of v2 Cloud Run URLs.

## The Bug

When using `onSchedule()` with a string parameter (e.g., `onSchedule('every 1 minutes', handler)`), Cloud Scheduler jobs are created with v1 function URLs (`cloudfunctions.net`) instead of v2 Cloud Run URLs (`run.app`), causing `PERMISSION_DENIED` errors when the scheduler tries to invoke the function.

The object syntax works correctly and creates jobs with the proper v2 Cloud Run URLs.

## Original Issue Report

**GitHub Issue**: [firebase/firebase-functions#1734](https://github.com/firebase/firebase-functions/issues/1734)

**Environment Info**:
- firebase-functions: 6.4.0
- firebase-tools: 14.16.0
- Platform: macOS (Darwin 25.0.0)

## Test Case

### Failing Code (String Syntax)
```typescript
import { onSchedule } from 'firebase-functions/v2/scheduler'

// This FAILS - creates scheduler with wrong URL format
export const failingScheduler = onSchedule(
  'every 1 minutes',
  async () => {
    console.log('This function gets PERMISSION_DENIED')
  }
)
```

### Working Code (Object Syntax)
```typescript
// This WORKS - creates scheduler with correct URL
export const workingScheduler = onSchedule(
  {
    schedule: 'every 1 minutes', 
    timeZone: 'America/Los_Angeles',
  },
  async () => {
    console.log('This function works correctly')
  }
)
```

## Prerequisites

- Node.js v20 or later
- Firebase CLI v14.16.0+ (`npm install -g firebase-tools`)
- Google Cloud CLI (`gcloud`) - optional, for verification script
- Firebase project with Blaze (pay-as-you-go) plan
- Authenticated with both Firebase and gcloud:
  ```bash
  firebase login
  gcloud auth login
  ```

## Setup

1. Configure your project:
   ```bash
   # Set your Firebase project
   firebase use YOUR_PROJECT_ID
   
   # Or edit .firebaserc and replace YOUR_PROJECT_ID
   ```

2. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

3. Build the TypeScript:
   ```bash
   npm run build
   ```

## Steps to Reproduce

### Step 1: Deploy the functions

```bash
firebase deploy --only functions
```

The deployment should succeed without any warnings or errors.

### Step 2: Check Cloud Scheduler Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Cloud Scheduler** in your project
3. Look for two jobs:
   - `failingScheduler` (created from string syntax)
   - `workingScheduler` (created from object syntax)

### Step 3: Verify the Bug

**Expected Behavior:**
- Both scheduler jobs should have v2 Cloud Run URLs in the format: `https://FUNCTION_NAME-HASH-uc.a.run.app/`

**Actual Behavior:**
- `failingScheduler` job has URL: `https://us-central1-PROJECT.cloudfunctions.net/failingScheduler` (v1 format - **WRONG**)
- `workingScheduler` job has URL: `https://workingscheduler-HASH-uc.a.run.app/` (v2 format - **CORRECT**)

### Step 4: Test Function Execution

1. **Manually trigger `failingScheduler` job:**
   - In Cloud Scheduler console, click "RUN NOW" for `failingScheduler`
   - Check the execution logs
   - **Result**: Should show `PERMISSION_DENIED` error

2. **Manually trigger `workingScheduler` job:**
   - In Cloud Scheduler console, click "RUN NOW" for `workingScheduler`
   - Check the execution logs
   - **Result**: Should execute successfully

### Step 5: Verify with gcloud (Optional)

You can also verify using the verification script:

```bash
chmod +x scripts/verify-bug.sh
PROJECT_ID=your-project-id ./scripts/verify-bug.sh
```

Or manually check with gcloud:

```bash
gcloud scheduler jobs list --project=YOUR_PROJECT_ID --format="table(name,httpTarget.uri,pubsubTarget.topicName)"
```

Look for jobs with URLs containing `cloudfunctions.net` (v1) instead of `run.app` (v2).

## Expected Behavior

Both syntaxes should create Cloud Scheduler jobs with the correct v2 Cloud Run URLs (format: `https://FUNCTION_NAME-HASH-uc.a.run.app/`).

## Actual Behavior

When using the string parameter syntax, Cloud Scheduler jobs are created with v1 function URLs that don't exist, causing `PERMISSION_DENIED` errors.

Cloud Scheduler shows:
- Functions with string syntax: URL points to `cloudfunctions.net` (v1) - **FAILS**
- Functions with object syntax: URL points to `run.app` (v2) - **WORKS**

## Analysis

The TypeScript types allow both signatures:
- `onSchedule(schedule: string, handler: Function)`
- `onSchedule(options: ScheduleOptions, handler: Function)`

However, only the object syntax properly configures the Cloud Scheduler job with the correct Cloud Run URL. This is a critical bug because:

1. The types suggest both are valid
2. The deployment succeeds without warnings
3. The error only appears at runtime when scheduler tries to invoke the function
4. The error message (`PERMISSION_DENIED`) doesn't indicate the root cause is a URL mismatch

## Workaround

Always use the object syntax with explicit `schedule` and `timeZone` properties:

```typescript
onSchedule({
  schedule: 'every 1 minutes',
  timeZone: 'America/Los_Angeles',
}, handler)
```

## Root Cause

The bug likely occurs in `firebase-tools` when creating the Cloud Scheduler job. The `jobFromEndpoint` function in `firebase-tools/src/gcp/cloudscheduler.ts` uses `endpoint.uri!` for v2 functions. The issue may be:

1. `endpoint.uri` not being set correctly when using string syntax
2. Endpoint being treated as v1 instead of v2
3. URI fallback to v1 format when undefined

## Project Structure

```
onSchedule-string-parameter-bug-1734/
├── functions/
│   ├── src/
│   │   └── index.ts              # Contains both failing and working schedulers
│   ├── package.json
│   └── tsconfig.json
├── scripts/
│   └── verify-bug.sh            # Optional verification script
├── firebase.json
├── .firebaserc
└── README.md
```

## Related Issues

This appears related to:
- [cloud function error: PERMISSION_DENIED: Missing or insufficient permissions #1425](https://github.com/firebase/firebase-functions/issues/1425) (PERMISSION_DENIED errors)
- [Cloud Function V2 randomly not creating deterministic Function URL #1447](https://github.com/firebase/firebase-functions/issues/1447) (Cloud Function V2 not creating deterministic Function URL)
- [V2 scheduled functions do not refuse to deploy if the scheduler region is incompatible #1293](https://github.com/firebase/firebase-functions/issues/1293) (V2 scheduled functions deployment issues)

## Environment Info

- firebase-functions: 6.4.0
- firebase-tools: 14.16.0
- Platform: macOS / Linux / Windows
- Node.js: 20
- GCP Services: Cloud Scheduler, Cloud Functions v2, Cloud Run

## Next Steps

1. Test the MRE to confirm it reproduces the issue
2. Investigate `firebase-tools` code to find where the URI is incorrectly set
3. Fix the bug in `firebase-tools` (likely in endpoint URI resolution or scheduler job creation)
4. Update tests to cover both string and object syntax

