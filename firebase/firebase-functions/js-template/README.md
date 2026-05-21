# Repro For firebase-functions Issue #1889

This repository is a minimal repro for [firebase/firebase-functions#1889](https://github.com/firebase/firebase-functions/issues/1889):

> V2 RTDB functions suddenly trigger with `authType=unknown` and `uid=null`

The repro compares two Realtime Database triggers on the same write:

- a v2 trigger using `onValueWritten`
- a v1 trigger using `database.ref(...).onWrite(...)`

Expected result:

- both functions receive authenticated user context for a client-originated write

Actual result reported in the issue:

- v1 receives the expected auth context
- v2 logs `authType=unknown` and a missing user id

## Repository Layout

```text
js-template/
├── .firebaserc
├── firebase.json
├── README.md
└── functions/
    ├── index.js
    ├── package.json
    └── repro.html
```

## What Is In The Repro

### Functions

[`functions/index.js`](functions/index.js) exports two triggers on the same RTDB path:

- `writeTransactionChangeV2`
- `writeTransactionChangeV1`

Both listen on:

```text
/transactions/{groupId}/{entityId}
```

Both log the auth-related fields they receive so the output can be compared directly.

### Client Repro Page

[`functions/repro.html`](functions/repro.html) is a tiny browser page that:

- initializes the Firebase Web SDK
- signs in anonymously
- writes to the Realtime Database

That single write should invoke both functions.

## Versions In This Repo

From [`functions/package.json`](functions/package.json):

- `firebase-functions`: `7.2.6-rc.0`
- `firebase-admin`: `^13.4.0`
- `firebase-tools`: `^14.6.0`

The linked issue was filed on May 20, 2026 and reports:

- `firebase-functions`: `^7.2.5`
- `firebase-admin`: `^13.8.0`
- `firebase-tools`: `15.1.0`
- `node`: `22`

This repo is close to, but not byte-for-byte identical to, the issue environment.

## Prerequisites

- Node.js installed
- Firebase CLI access
- A Firebase project with:
  - Authentication enabled
  - Realtime Database enabled
  - Functions enabled

## Setup

1. Install root dependencies if needed.

```bash
npm install
```

2. Install Functions dependencies.

```bash
cd functions
npm install
```

3. Point the repo at a real Firebase project.

Update [`.firebaserc`](.firebaserc) and replace:

```json
{
  "projects": {
    "default": "YOUR_PROJECT_ID"
  }
}
```

4. Update the web app config in [`functions/repro.html`](functions/repro.html):

- `apiKey`
- `authDomain`
- `databaseURL`
- `projectId`
- `appId`

5. Make sure anonymous auth is enabled in Firebase Authentication.

6. Make sure the client can write to the target RTDB path for the repro.

## Run The Repro

### Option 1: Deploy To A Real Project

From the repo root:

```bash
firebase deploy --only functions
```

Then serve or open `functions/repro.html` in a browser environment, click `Sign in and write`, and inspect the function logs.

Useful command:

```bash
cd functions
npm run logs
```

### Option 2: Emulator

From the repo root:

```bash
firebase emulators:start
```

If you test against the Emulator Suite, make sure the web page is adjusted to target the local emulators as needed. This repo does not currently wire emulator hosts into `repro.html` by default.

## Expected Log Shape

For the same database write:

- v1 should log `context.auth` and `context.authType`
- v2 should log `event.authId` and `event.authType`

The bug is reproduced when:

- `AUTH-TEST v1` shows the authenticated user correctly
- `AUTH-TEST v2` shows `authType: "unknown"` and `authId: null`

## Notes

- The repro intentionally keeps both v1 and v2 triggers active on the same path so the comparison is immediate.
- The HTML client uses anonymous sign-in because it provides a fast authenticated client write with minimal setup.
- The original issue notes that this behavior appeared suddenly between May 6, 2026 and May 15, 2026 in one Firebase project but not another.
