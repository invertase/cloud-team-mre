# Firebase Issue #8984 - IAM Policy Race Condition Bug

This MRE demonstrates a race condition in Firebase Functions deployment where IAM policies are not applied after a failed initial deploy.

## The Bug

```
Initial Deploy (fails health check)
    ├── Create Cloud Run service ✓ (service exists, but broken)
    ├── Health check ✗ (container crashes)
    └── Set IAM policies ✗ (skipped due to failure)

Second Deploy (succeeds)
    ├── Detect existing service → treat as "update"
    ├── Update Cloud Run service ✓
    ├── Health check ✓
    └── Set IAM policies ✗ (skipped because it's an "update", not "create")
```

**Problem**: IAM policies are only applied on "create" operations, but the failed initial deploy left a broken service behind, so all subsequent deploys are treated as "updates."

## Original Issue Report

> **[REQUIRED] Environment info**
> - firebase-tools: 14.11.1
> - Platform: Debian
> - Node: 22
>
> **[REQUIRED] Test case**
>
> File: `functions/src/feature.local/somethingModule.ts`
> ```typescript
> export const value = "some value";
> ```
>
> File: `functions/src/index.ts`
> ```typescript
> import { onRequest } from "firebase-functions/https";
>
> // The module that would not be included in the Cloud Run container.
> import { value } from "./feature.local/somethingModule";
>
> export const helloFailingInitialDeploy = onRequest((request, response) => {
>   response.send(`Hello from Firebase! The value is: ${value}`);
> });
> ```
>
> **[REQUIRED] Steps to reproduce**
> 1. Initialize a new codebase with `firebase init` and select "functions"
> 2. Implement a function with a bug (import from `*.local` directory which is ignored)
> 3. Deploy - it fails the health check
> 4. Fix the bug (inline the value instead of importing)
> 5. Deploy again - it "succeeds" but IAM policies are not applied
> 6. Curl the function URL - get 403 Forbidden
>
> **[REQUIRED] Expected behavior**
> The function invocation permissions must allow public access after a successful deployment.
>
> **[REQUIRED] Actual behavior**
> Even after successful consequent deployments, the Cloud Run console shows that invocations of the functions "Require authentication". Navigating to the function endpoint returns a "403 Forbidden" error.

## Prerequisites

- Node.js v22 or later
- Firebase CLI v14.11.0+ (`npm install -g firebase-tools`)
- Google Cloud CLI (`gcloud`)
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

   # Set your gcloud project (must match)
   gcloud config set project YOUR_PROJECT_ID
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

### Step 1: Ensure no existing function with this name

```bash
firebase functions:delete helloFailingInitialDeploy --force 2>/dev/null || true
```

### Step 2: Deploy the buggy version (will fail)

```bash
firebase deploy --only functions
```

This will fail with an error like:
```
Container Healthcheck failed. Revision 'hellofailinginitialdeploy-00001-xxx' is not ready...
```

The key indicator is: `creating Node.js 22 (2nd Gen) function...`

### Step 3: Fix the bug

```bash
cp functions/src/index.ts.fixed functions/src/index.ts
npm run build --prefix functions
```

### Step 4: Deploy again (will "succeed")

```bash
firebase deploy --only functions
```

This time it will succeed, but note the output says:
`updating Node.js 22 (2nd Gen) function...` (not "creating")

### Step 5: Verify the bug

```bash
chmod +x scripts/verify-bug.sh
PROJECT_ID=your-project-id ./scripts/verify-bug.sh
```

Or simply curl the function URL - you'll get 403 Forbidden:
```bash
curl https://hellofailinginitialdeploy-XXXXXX-uc.a.run.app
# Returns: 403 Forbidden
```

## Expected Behavior

After a successful deployment, the function should be publicly accessible and return 200 OK.

## Actual Behavior

- Function returns 403 Forbidden
- Cloud Run console shows "Require authentication" instead of "Allow unauthenticated"
- IAM policies were never applied because the "successful" deploy was treated as an "update"

## Root Cause

In `firebase-tools`, IAM policies (specifically `allUsers` as `run.invoker`) are only applied during the initial "create" operation for a Cloud Run service. When:

1. The first deploy fails after creating the service (but before setting IAM)
2. Subsequent deploys detect the existing service and treat it as an "update"
3. The IAM policy step is skipped for updates

This leaves the function in a state where it exists and works, but requires authentication when it shouldn't.

## Workarounds

### Option 1: Delete the broken function and redeploy

```bash
firebase functions:delete helloFailingInitialDeploy --force
firebase deploy --only functions
```

### Option 2: Manually set the IAM policy

```bash
PROJECT_ID=your-project-id ./scripts/fix-iam.sh
```

Or directly with gcloud:
```bash
gcloud run services add-iam-policy-binding hellofailinginitialdeploy \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"
```

### Option 3: Via Cloud Console

1. Go to Cloud Run in Google Cloud Console
2. Select the service (`hellofailinginitialdeploy`)
3. Go to Security tab
4. Enable "Allow unauthenticated invocations"

## Project Structure

```
iam-race-condition-issue-8984/
├── functions/
│   ├── src/
│   │   ├── index.ts                    # Buggy version (imports from *.local)
│   │   ├── index.ts.fixed              # Fixed version (inline value)
│   │   └── feature.local/
│   │       └── somethingModule.ts      # Module excluded by ignore pattern
│   ├── package.json
│   └── tsconfig.json
├── scripts/
│   ├── verify-bug.sh                   # Verify the IAM policy is missing
│   └── fix-iam.sh                      # Workaround to fix IAM manually
├── firebase.json                       # Note: *.local in ignore list!
├── .firebaserc
└── README.md
```

## Key Files

### firebase.json (the ignore pattern is critical!)

```json
{
  "functions": [
    {
      "ignore": [
        "node_modules",
        "*.local",   // <-- This excludes feature.local/ from deploy
        "*.log"
      ]
    }
  ]
}
```

## Environment Info

- firebase-tools: 14.11.1
- Platform: macOS / Linux / Windows
- Node.js: 22
- GCP Services: Cloud Run, Cloud Functions

## Suggested Fix for firebase-tools

Either:
1. Failed initial deployments should clean up the broken service, OR
2. IAM policies should be re-checked/applied on updates if they're missing

## Related Links

- [GitHub Issue #8984](https://github.com/firebase/firebase-tools/issues/8984)
- [Firebase CLI Repository](https://github.com/firebase/firebase-tools)
