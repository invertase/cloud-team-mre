# MRE for `firebase/firebase-functions#1803`

This reproduces issue [#1803](https://github.com/firebase/firebase-functions/issues/1803): Firestore Enterprise deploys fail when a v2 Firestore trigger sets `database` and the backend rejects an implicit `namespace` filter.

## Issue Versions

- `node`: `24.12.0`
- `firebase-functions`: `7.0.3`
- `firebase-tools`: `15.3.1`
- `firebase-admin`: `13.6.0`

## Prerequisites

- Node.js 24.x
- Firebase CLI 15.3.1 (`npm i -g firebase-tools@15.3.1`)
- A Firebase project with a Firestore Enterprise database (database id: `my-firestore-enterprise-db`)

## Setup

1. Set your Firebase project in `.firebaserc`.
2. Install dependencies:
   ```bash
   cd firebase/firebase-functions/issue-1803/functions
   npm install
   npm run check
   ```

## Reproduction

1. From `firebase/firebase-functions/issue-1803`, deploy:
   ```bash
   firebase deploy --only functions:userCreated
   ```

2. The function code is:
   ```js
   import { onDocumentCreated } from "firebase-functions/firestore";

   export const userCreated = onDocumentCreated(
     {
       document: "users/{user_id}",
       database: "my-firestore-enterprise-db",
     },
     (event) => {
       console.log("User created:", event.params.user_id);
     }
   );
   ```

## Expected Behavior

The function should deploy successfully.

## Actual Behavior

Deployment fails with:

```txt
HTTP Error: 400, Validation failed for trigger projects/<project-id>/locations/nam5/triggers/<trigger-id>: The request was invalid: generic::invalid_argument: 'namespace' filter is not supported in Firestore Enterprise edition.
```
