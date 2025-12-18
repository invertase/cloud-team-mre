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

## Steps to Reproduce

1. **Install dependencies:**
   ```bash
   cd functions
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Login to Firebase (if not already logged in):**
   ```bash
   firebase login
   ```

4. **Initialize Firebase project (if not already done):**
   ```bash
   firebase init
   ```
   - Select "Functions" when prompted
   - Use an existing project or create a new one
   - Choose TypeScript
   - Use default settings

5. **Deploy functions:**
   ```bash
   npm run deploy
   ```
   Or from the root directory:
   ```bash
   firebase deploy --only functions
   ```

6. **Check Cloud Scheduler console:**
   - **Direct link:** [Cloud Scheduler Console](https://console.cloud.google.com/cloudscheduler)
   - **Alternative:** Go to [Google Cloud Console](https://console.cloud.google.com) → Select your project → Navigation menu (☰) → "Cloud Scheduler" (under "Serverless")
   - Find the two scheduler jobs: `failingScheduler` and `workingScheduler`
   - Click on each job to view details
   - In the job details, check the "Target" section to see the URL:
     - `failingScheduler`: URL points to `https://us-central1-PROJECT.cloudfunctions.net/failingScheduler` (v1 format) - **FAILS**
     - `workingScheduler`: URL points to `https://workingScheduler-HASH-uc.a.run.app/` (v2 format) - **WORKS**

7. **Verify the error:**
   - Wait for the scheduler to trigger (every 1 minute)
   - Check Cloud Functions logs:
     ```bash
     npm run logs
     ```
   - Or view in [Cloud Console > Cloud Functions > Logs](https://console.cloud.google.com/functions/list)
   - `failingScheduler` will show `PERMISSION_DENIED` errors
   - `workingScheduler` will execute successfully

## Verification

After deployment, verify the issue:

1. **Check Cloud Scheduler job URLs:**
   ```bash
   gcloud scheduler jobs list --format="table(name,schedule,httpTarget.uri)"
   ```

2. **Expected output:**
   - `failingScheduler`: URL should be `https://us-central1-PROJECT.cloudfunctions.net/failingScheduler` (incorrect v1 format)
   - `workingScheduler`: URL should be `https://workingScheduler-HASH-uc.a.run.app/` (correct v2 format)

3. **Check function execution logs:**
   ```bash
   gcloud functions logs read failingScheduler --limit 10
   gcloud functions logs read workingScheduler --limit 10
   ```

## Workaround

Until this bug is fixed, always use the object syntax with explicit `schedule` and `timeZone` properties:

```typescript
onSchedule({
  schedule: "every 1 minutes",
  timeZone: "America/Los_Angeles",
}, handler)
```

## Related Issues

- [cloud function error: PERMISSION_DENIED: Missing or insufficient permissions #1425](https://github.com/firebase/firebase-functions/issues/1425)
- [Cloud Function V2 randomly not creating deterministic Function URL #1447](https://github.com/firebase/firebase-functions/issues/1447)
- [V2 scheduled functions do not refuse to deploy if the scheduler region is incompatible #1293](https://github.com/firebase/firebase-functions/issues/1293)

## Notes

- The deployment succeeds without warnings, making this bug hard to detect
- The error only appears at runtime when the scheduler tries to invoke the function
- The error message (`PERMISSION_DENIED`) doesn't indicate the root cause is a URL mismatch

