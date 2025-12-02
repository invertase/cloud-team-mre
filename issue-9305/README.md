# Issue #9305: firebase functions:delete fails for onTaskDispatched function

## Bug Description

The `firebase functions:delete` command fails for `onTaskDispatched` functions. When deleting a function, it incorrectly attempts to create or update a Cloud Tasks queue, which fails if the queue was recently deleted manually.

**Issue**: https://github.com/firebase/firebase-tools/issues/9305

## Prerequisites

- Node.js (v20 or later)
- Firebase CLI version **14.19.1** (matches the environment where the bug was reported)
  - Install globally: `npm install -g firebase-tools@14.19.1`
  - Or use via npx: `npx firebase-tools@14.19.1` (the package.json includes it as a dev dependency)
- Firebase project with Blaze plan (required for Functions)
- Google Cloud Console access
- Platform: macOS (as reported in the issue, though the bug may occur on other platforms)
