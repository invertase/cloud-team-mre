# Issue #1735 MRE: Cloud Scheduler PERMISSION_DENIED with correct Cloud Run URLs and IAM

## Description

This MRE reproduces a bug where Firebase Functions v2 scheduled functions receive `PERMISSION_DENIED` errors from Cloud Scheduler, even when:
- Cloud Scheduler jobs are created with correct Cloud Run URLs (`.run.app` format)
- Cloud Run services have correct IAM bindings (`roles/run.invoker` for the service account)
- Scheduler jobs have correct OIDC token configuration
- Manual invocation with the same service account credentials works fine

## Environment

- **firebase-functions:** 6.4.0
- **firebase-tools:** 14.16.0
- **Platform:** macOS (Darwin 25.0.0)
- **Node.js:** 20