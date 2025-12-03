# Firebase CLI Issue #8775 - Functions with Secrets MRE

This is a Minimal Reproducible Example (MRE) for [Firebase CLI issue #8775](https://github.com/firebase/firebase-tools/issues/8775).

## Issue Description

Firebase CLI fails to deploy 2nd gen Cloud Functions with secrets, misreporting the issue as an IAM problem. The CLI should auto-create secrets from `.env` files in Secret Manager and grant the necessary IAM roles, but instead it shows incomplete gcloud commands and fails with IAM errors.

## Prerequisites

- Node.js (v20 or later)
- Firebase CLI version 14.8.0 (will be installed locally via npm, or install globally: `npm install -g firebase-tools@14.8.0`)
- Firebase project with Blaze plan (required for Functions)
- Required APIs enabled:
  - `cloudfunctions.googleapis.com`
  - `cloudbuild.googleapis.com`
  - `secretmanager.googleapis.com`
