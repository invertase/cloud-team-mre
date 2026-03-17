# firebase-functions issue #1180 MRE

Minimal reproducible example for:
https://github.com/firebase/firebase-functions/issues/1180

This MRE reproduces a failing Firestore trigger that returns a rejected Promise,
using the same core code pattern from the issue report.

## Prerequisites

- Node.js 20+
- Firebase CLI

## Setup

1. Install dependencies:

   ```bash
   cd functions
   npm install
   ```

## Reproduce (Emulator)

1. Start emulators:

   ```bash
   npm run serve:functions
   ```

2. In another terminal, trigger a Firestore write through the helper HTTP function:

   ```bash
   curl "http://127.0.0.1:5001/demo-issue-1180/us-central1/createStuff"
   ```

3. Observe emulator logs for `func`:
   - The function rejects with:
     `Error: I'm just returning a rejected promise`
   - Compare how many error log entries are emitted for that failure.

## Reproduce (Deployed Function / Cloud Logging)

1. Deploy:

   ```bash
   npm run deploy
   ```

2. Invoke `createStuff` in your deployed project.
3. Open Cloud Logging and inspect logs for function `func`.
4. Verify whether the same failure appears more than once with different timestamps.

## Notes

- `func` intentionally fails and matches the original issue snippet.
- `createStuff` only exists to trigger the Firestore write quickly for repro.
