# Artifact Registry Permission Denied - Issue #8431

This MRE reproduces [firebase-tools issue #8431](https://github.com/firebase/firebase-tools/issues/8431): Permission "artifactregistry.repositories.downloadArtifacts" denied when deploying Firebase Cloud Function.

## Issue Description

When deploying Firebase Gen 2 Cloud Functions, users encounter the following error:

```
Build failed with status: FAILURE. Could not build the function due to a missing permission
on the build service account.
```

Or in Cloud Build logs:
```
ERROR: failed to create image cache:
accessing cache image "us-central1-docker.pkg.dev/[Project ID]/gcf-artifacts/...":
DENIED: Permission "artifactregistry.repositories.downloadArtifacts" denied on resource
"projects/[Project ID]/locations/us-central1/repositories/gcf-artifacts" (or it may not exist)
```

## Root Cause

The default compute service account (`[PROJECT_NUMBER]-compute@developer.gserviceaccount.com`) is missing the `roles/cloudbuild.builds.builder` role, which is required for Cloud Build to access Artifact Registry during Gen 2 function deployment.

This can happen when:
- Setting up a new Firebase/GCP project
- IAM policies have been modified
- The default compute service account was recreated

## ⚠️ Important: Requirements to Reproduce

**This issue will NOT reproduce if the default compute service account has `roles/editor`.**

Most development/test projects grant `roles/editor` to the default compute SA, which includes broad permissions that cover Artifact Registry access. You can check this with:

```bash
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --format="table(bindings.role)"
```

If you see `roles/editor` in the output, you have two options:

1. **Use a different project** with more restrictive IAM policies
2. **Temporarily remove `roles/editor`** from the compute SA (see warning below)

---

## ⛔ WARNING: Removing `roles/editor`

If you choose to remove `roles/editor` from the default compute SA to reproduce this issue:

**THIS MAY BREAK OTHER SERVICES IN YOUR PROJECT**, including:
- Other Cloud Functions
- Cloud Run services
- App Engine applications
- Any service relying on the default compute SA

**Only do this on a test/throwaway project!**

To remove `roles/editor`:
```bash
gcloud projects remove-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/editor"
```

To restore it afterwards:
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/editor"
```

---

## Prerequisites

- Node.js v20+
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud CLI (`gcloud`)
- Firebase project with Blaze plan
- Authenticated with both Firebase and GCP:
  ```bash
  firebase login
  gcloud auth login
  ```

## Setup

1. Update `.firebaserc` with your project ID:
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

2. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Steps to Reproduce

### Step 1: Check current state

```bash
./scripts/verify-bug.sh your-project-id
```

This tells you if the default compute SA has the required role.

### Step 2: Check if compute SA has `roles/editor`

```bash
gcloud projects get-iam-policy your-project-id \
  --flatten="bindings[].members" \
  --filter="bindings.members:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --format="table(bindings.role)"
```

If `roles/editor` is present, the issue won't reproduce (see warning above about removing it).

### Step 3: Attempt deployment

```bash
cd functions
firebase deploy --only functions:getLatestID
```

If the compute SA lacks both `roles/editor` AND `roles/cloudbuild.builds.builder`, you'll see:

```
Build failed with status: FAILURE. Could not build the function due to a missing permission
on the build service account.
```

### Alternative: Use gcloud for better error messages

The `gcloud` CLI provides more helpful error messages than Firebase:

```bash
gcloud functions deploy getLatestID \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=. \
  --entry-point=getLatestID \
  --trigger-http
```

gcloud will warn you:
```
The default build service account [PROJECT_NUMBER-compute@developer.gserviceaccount.com]
is missing the [roles/cloudbuild.builds.builder] role.
```

## Expected Behavior

The function deploys successfully and can be invoked.

## Actual Behavior

Deployment fails with a permission denied error related to Artifact Registry.

## Solution

Add the `roles/cloudbuild.builds.builder` role to the default compute service account:

### Using the provided script:

```bash
./scripts/fix-permissions.sh your-project-id
```

### Or manually with gcloud:

```bash
PROJECT_ID="your-project-id"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com \
  --role=roles/cloudbuild.builds.builder
```

After applying the fix, retry the deployment:

```bash
cd functions
firebase deploy --only functions:getLatestID
```

## Verification

After fixing, verify the deployment works:

```bash
# Check the role is assigned
./scripts/verify-bug.sh your-project-id

# Deploy the function
cd functions
firebase deploy --only functions:getLatestID

# Test the function (replace with your actual function URL)
curl https://us-central1-your-project-id.cloudfunctions.net/getLatestID
```

## Project Structure

```
artifact-registry-issue-8431/
├── functions/
│   ├── src/
│   │   └── index.ts          # Gen 2 HTTP function
│   ├── package.json          # Dependencies and scripts
│   └── tsconfig.json         # TypeScript configuration
├── scripts/
│   ├── verify-bug.sh         # Check if SA has required role
│   ├── fix-permissions.sh    # Add the missing role
│   └── remove-role.sh        # Remove role (to reproduce issue)
├── firebase.json             # Firebase configuration
├── .firebaserc               # Project reference
└── README.md                 # This file
```

## Related Links

- [GitHub Issue #8431](https://github.com/firebase/firebase-tools/issues/8431)
- [Cloud Functions Troubleshooting - Build Service Account](https://cloud.google.com/functions/docs/troubleshooting#build-service-account)
- [Artifact Registry IAM Permissions](https://cloud.google.com/artifact-registry/docs/access-control)
