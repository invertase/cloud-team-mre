# Firebase Python Cloud Functions Authentication Bug MRE

A Minimal Reproducible Example (MRE) for [Firebase Python Cloud Functions Issue #126](https://github.com/firebase/firebase-functions-python/issues/126).

## The Bug

When initializing `firestore.client()` at module scope in a Python Cloud Function, deployment fails with `DefaultCredentialsError` even with proper authentication.

**Error:**
```
google.auth.exceptions.DefaultCredentialsError: Your default credentials were not found.
```

## Root Cause

Firebase CLI's code discovery process executes module-level code during deployment but doesn't pass authentication credentials to this process. The bug occurs specifically during the discovery phase, not during function execution.

## Quick Reproduction

1. **Install act** (for running GitHub Actions locally):
   ```bash
   brew install act  # macOS
   # or download from https://github.com/nektos/act/releases
   ```

2. **Set up secrets** in `.secrets` file:
   ```
   SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
   FIREBASE_PROJECT_ID=your-project-id
   ```

3. **Run the reproduction**:
   ```bash
   act workflow_dispatch -P ubuntu-22.04=python:3.11-slim --container-architecture linux/amd64 --secret-file .secrets
   ```
