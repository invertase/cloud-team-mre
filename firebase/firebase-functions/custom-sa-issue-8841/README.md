# Firebase Issue #8841 - Custom Service Account Ignored When Default SA Deleted

This MRE demonstrates that Firebase CLI fails to deploy v2 Cloud Functions when the default compute service account is deleted, even when a custom service account is explicitly specified via `setGlobalOptions()`.

> ⚠️ **WARNING: This MRE involves deleting the default compute service account**
>
> The default compute service account (`PROJECT_NUMBER-compute@developer.gserviceaccount.com`) is used by many GCP services including Compute Engine, Cloud Functions, Cloud Run, and App Engine.
>
> **Before running this MRE:**
> - Use a **test project only** - do not use production projects
> - Understand that deleted SAs can only be restored within 30 days
> - After 30 days, the SA is permanently deleted and cannot be recovered
> - Other services in your project may break while the SA is deleted

## Original Issue Report

> **[REQUIRED] Environment info**
> - firebase-tools: 14.10.1
> - Platform: macOS
> - NodeJS: v22.11.0
> - firebase-admin: ^12.6.0
> - firebase-functions: ^6.0.1
>
> **[REQUIRED] Steps to reproduce**
> 1. Create a new firebase project
> 2. Deploy a function using `firebase deploy --only functions`
> 3. Delete `xxx-compute@developer.gserviceaccount.com` service account in GCP Console
> 4. Create a new service account and grant it the Editor role
> 5. Update index.js to use `setGlobalOptions({ serviceAccount: "custom@..." })`
> 6. Run `firebase deploy --only functions` again
> 7. Got errors: `HTTP Error: 404, Service account projects/-/serviceAccounts/xxx-compute@developer.gserviceaccount.com was not found.`
>
> **[REQUIRED] Expected behavior**
> Firebase CLI should use the custom service account I set up
>
> **[REQUIRED] Actual behavior**
> Firebase CLI still using default service account
>
> **PS**: I recently wanted to upgrade the code of an old project to the 2gen function, but in the QA environment, I don't know who deleted the service account `xxx-compute@developer.gserviceaccount.com`, and it has been more than 30 days and cannot be retrieved.

## Root Cause Analysis

From the debug logs, the issue is clear:

1. **User specifies custom SA**: `setGlobalOptions({ serviceAccount: "compute-custom@..." })`

2. **Firebase CLI correctly applies it to `serviceConfig`**:
   ```json
   "serviceConfig": {
     "serviceAccountEmail": "compute-custom@YOUR_PROJECT_ID.iam.gserviceaccount.com"
   }
   ```

3. **But `buildConfig.serviceAccount` still references the old default SA**:
   ```json
   "buildConfig": {
     "serviceAccount": "projects/YOUR_PROJECT_ID/serviceAccounts/XXXXXXXXXXXX-compute@developer.gserviceaccount.com"
   }
   ```

4. **The error comes from the build step**, not the runtime configuration:
   ```
   HTTP Error: 404, Service account projects/-/serviceAccounts/XXXXXXXXXXXX-compute@developer.gserviceaccount.com was not found.
   ```

The bug: Firebase CLI does not update `buildConfig.serviceAccount` when a custom service account is specified via `setGlobalOptions()`. It only updates `serviceConfig.serviceAccountEmail` (the runtime SA).

---

## MRE Reproduction Results

This MRE was tested and successfully confirmed the bug:

```
$ firebase deploy --only=functions --project=YOUR_PROJECT_ID

=== Deploying to 'YOUR_PROJECT_ID'...

i  deploying functions
i  functions: preparing codebase default for deployment
...
i  functions: updating Node.js 22 (2nd Gen) function testGroup-addmessage(us-central1)...
⚠  functions: Request to https://cloudfunctions.googleapis.com/v2/projects/YOUR_PROJECT_ID/locations/us-central1/functions/testGroup-addmessage?updateMask=... had HTTP Error: 404, Service account projects/-/serviceAccounts/XXXXXXXXXXXX-compute@developer.gserviceaccount.com was not found.
⚠  functions:  failed to update function projects/YOUR_PROJECT_ID/locations/us-central1/functions/testGroup-addmessage
Failed to update function projects/YOUR_PROJECT_ID/locations/us-central1/functions/testGroup-addmessage

Functions deploy had errors with the following functions:
        testGroup-addmessage(us-central1)

Error: There was an error deploying functions
```

**Bug confirmed**: Despite specifying a custom service account via `setGlobalOptions({ serviceAccount: "compute-custom@..." })`, Firebase CLI still attempts to use the deleted default compute service account for the build configuration.

---

## Prerequisites

- Node.js v22 or later
- Firebase CLI v14.10.0+ (`npm install -g firebase-tools`)
- Google Cloud CLI (`gcloud`)
- Firebase project with Blaze (pay-as-you-go) plan
- Authenticated with both Firebase and gcloud:
  ```bash
  firebase login
  gcloud auth login
  gcloud config set project YOUR_PROJECT_ID
  ```

## Setup

1. **Configure your project**:
   ```bash
   # Set your Firebase project
   firebase use YOUR_PROJECT_ID

   # Verify gcloud project matches
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Create a custom service account**:
   ```bash
   cd scripts
   ./setup-custom-sa.sh YOUR_PROJECT_ID compute-custom
   ```

3. **Update the function code** with your custom SA email:
   ```typescript
   // functions/src/index.ts
   const CUSTOM_SERVICE_ACCOUNT = "compute-custom@YOUR_PROJECT_ID.iam.gserviceaccount.com";
   ```

4. **Install dependencies and build**:
   ```bash
   cd functions
   npm install
   npm run build
   ```

5. **Deploy the function once** (while default SA still exists):
   ```bash
   firebase deploy --only functions
   ```

## Steps to Reproduce

### Step 1: Delete the default compute service account

```bash
cd scripts
./delete-default-sa.sh YOUR_PROJECT_ID
```

**WARNING**: This is destructive! The default SA can only be restored within 30 days.

### Step 2: Attempt to redeploy with custom SA

```bash
firebase deploy --only functions
```

### Step 3: Observe the error

You will see an error like:
```
⚠  functions: Request to https://cloudfunctions.googleapis.com/v2/... had HTTP Error: 404,
Service account projects/-/serviceAccounts/XXXXXXXXXX-compute@developer.gserviceaccount.com was not found.
```

### Step 4: Verify the bug

```bash
cd scripts
./verify-bug.sh YOUR_PROJECT_ID
```

## Expected Behavior

Firebase CLI should use the custom service account specified in `setGlobalOptions()` for ALL operations, including:
- Building the function (`buildConfig.serviceAccount`)
- Running the function (`serviceConfig.serviceAccountEmail`)

The deployment should succeed using the custom SA.

## Actual Behavior

- Firebase CLI correctly sets `serviceConfig.serviceAccountEmail` to the custom SA
- But `buildConfig.serviceAccount` still references the deleted default SA
- Deployment fails with `404 Service account not found`
- No workaround exists besides restoring the default SA or creating a new project

## Debug Log Analysis

Key sections from `firebase-debug.log`:

```
[debug] >>> [apiv2][body] PATCH https://cloudfunctions.googleapis.com/v2/.../testGroup-addmessage
{
  "buildConfig": {
    "serviceAccount": "projects/.../serviceAccounts/XXXXXXXXXXXX-compute@developer.gserviceaccount.com"  // <-- OLD SA!
  },
  "serviceConfig": {
    "serviceAccountEmail": "compute-custom@YOUR_PROJECT_ID.iam.gserviceaccount.com"  // <-- Custom SA (correct)
  }
}

[debug] <<< [apiv2][body] PATCH ... 404
{
  "error": {
    "code": 404,
    "message": "Service account projects/-/serviceAccounts/XXXXXXXXXXXX-compute@developer.gserviceaccount.com was not found.",
    "status": "NOT_FOUND"
  }
}
```

## Workarounds

Currently, there are **no known workarounds** that allow deployment when the default SA is deleted:

1. ❌ Using `setGlobalOptions({ serviceAccount: "..." })` - Does not work (this bug)
2. ❌ Using per-function `serviceAccount` option - Same issue
3. ❌ Renaming the function - Does not work
4. ❌ Deleting the old function first - Does not work
5. ❌ Rolling back Firebase CLI version - Does not work

The only solutions are:
- Restore the default SA (only works within 30 days of deletion)
- Create a new Firebase/GCP project

## Cleanup

To restore the default service account (within 30 days):

```bash
cd scripts
./restore-default-sa.sh YOUR_PROJECT_ID
```

## Project Structure

```
custom-sa-issue-8841/
├── functions/
│   ├── src/
│   │   └── index.ts          # Function with setGlobalOptions serviceAccount
│   ├── package.json
│   └── tsconfig.json
├── scripts/
│   ├── setup-custom-sa.sh    # Create custom service account
│   ├── delete-default-sa.sh  # Delete default SA (destructive!)
│   ├── verify-bug.sh         # Verify the bug exists
│   └── restore-default-sa.sh # Restore default SA (if within 30 days)
├── firebase.json
├── .firebaserc
└── README.md
```

## Environment Info

- firebase-tools: 14.10.1
- Platform: macOS / Linux
- Node.js: v22.x
- firebase-admin: ^12.6.0
- firebase-functions: ^6.0.1

## Related Links

- [GitHub Issue #8841](https://github.com/firebase/firebase-tools/issues/8841)
- [Firebase Functions Service Account Documentation](https://firebase.google.com/docs/functions/manage-functions#set_runtime_options)
- [GCP Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
