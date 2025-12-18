# Firebase Functions Issue #1235 - Region Mutation Bug MRE

This is a Minimal Reproducible Example (MRE) for [firebase-functions issue #1235](https://github.com/firebase/firebase-functions/issues/1235).

## Problem Description

When using `functions.runWith(RUNTIME_OPTS)` followed by `.region()`, the `RUNTIME_OPTS` object gets mutated by reference. This causes unexpected global updates across all function instances that share the same options object.

### Root Cause

The `FunctionBuilder` constructor in `firebase-functions/src/v1/function-builder.ts` takes the options object by reference rather than cloning it. When `.region()` is called, it mutates the original options object passed to `runWith()`, affecting all instances that share that object.

## Prerequisites

- Node.js (v16 or later)
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Blaze plan (required for Functions)

## Setup

1. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

2. Login to Firebase (if not already logged in):
   ```bash
   firebase login
   ```

3. Initialize Firebase project (if not already done):
   ```bash
   firebase init functions
   ```

## Reproduction Steps

### Step 1: Observe the Mutation

1. Start the Firebase emulator:
   ```bash
   npm run serve:functions
   ```

2. Observe the console output. You should see:
   ```
   === Demonstrating Region Mutation Bug ===
   RUNTIME_OPTS before any region calls: {
     "maxInstances": 3
   }
   
   After file2.js calls .region('europe-west1'):
   RUNTIME_OPTS after mutation: {
     "maxInstances": 3,
     "region": "europe-west1"
   }
   ```

   **This demonstrates the bug**: The `RUNTIME_OPTS` object was mutated, even though it should have remained unchanged.

### Step 2: Verify Deployment Behavior

1. Attempt to deploy the functions:
   ```bash
   npm run deploy
   ```

2. You may see deployment warnings or errors indicating that:
   - Functions intended for `europe-west3` are detected as being in `europe-west1`
   - The deployment tool may ask if you want to delete functions that "no longer exist locally" but actually exist in the cloud with the correct region

## Expected vs Actual Behavior

### Expected Behavior

- Each function should maintain its own region configuration independently
- Calling `.region()` on one function instance should not affect other function instances
- The `RUNTIME_OPTS` object should remain unchanged when `.region()` is called

### Actual Behavior

- Calling `.region()` on a `FunctionBuilder` created with `.runWith(RUNTIME_OPTS)` mutates the original `RUNTIME_OPTS` object
- All functions that share the same options object are affected
- Functions intended for one region (e.g., `europe-west3`) may be detected as being in a different region (e.g., `europe-west1`)

## Code Structure

```
issue-1235/
├── functions/
│   ├── localized-functions.js  # Shared functions instance with RUNTIME_OPTS
│   ├── file1.js                # Function using default region (europe-west3)
│   ├── file2.js                # Function that calls .region() to trigger mutation
│   ├── index.js                # Main entry point with demonstration code
│   └── package.json            # Dependencies
├── firebase.json               # Firebase configuration
└── README.md                   # This file
```

## How the Bug Works

1. **`localized-functions.js`** creates a shared `RUNTIME_OPTS` object and exports a `functions` instance:
   ```javascript
   export const RUNTIME_OPTS = { maxInstances: 3 };
   export const functions = _functions.runWith(RUNTIME_OPTS).region("europe-west3");
   ```

2. **`file1.js`** imports the shared `functions` instance and creates a function:
   ```javascript
   export const myTrigger = functions.https.onCall(...);
   ```
   This function should be in `europe-west3`.

3. **`file2.js`** imports the same shared `functions` instance and calls `.region("europe-west1")`:
   ```javascript
   export const myOtherTrigger = functions.region("europe-west1").https.onCall(...);
   ```
   **This is where the bug occurs**: The `.region()` call mutates the shared `RUNTIME_OPTS` object.

4. **Result**: The `RUNTIME_OPTS` object now has `region: "europe-west1"`, affecting all functions that use it, including `myTrigger` from `file1.js`.

## Technical Details

The bug is in `firebase-functions/src/v1/function-builder.ts`:

- The `FunctionBuilder` constructor takes `options` by reference:
  ```typescript
  constructor(private options: DeploymentOptions) {}
  ```

- When `.region()` is called, it mutates this shared object instead of creating a copy.

- The fix would be to clone the options object in the constructor:
  ```typescript
  constructor(private options: DeploymentOptions) {
    this.options = { ...options }; // Clone instead of reference
  }
  ```

## Workaround

To avoid this bug, you can:

1. **Clone the options object** before passing it to `runWith()`:
   ```javascript
   export const functions = _functions
     .runWith({ ...RUNTIME_OPTS })
     .region(DEFAULT_FUNCTIONS_REGION);
   ```

2. **Use separate options objects** for each function instance instead of sharing one.

3. **Call `.region()` before `.runWith()`** (this works because the method version of `runWith()` does clone the values):
   ```javascript
   export const functions = _functions
     .region(DEFAULT_FUNCTIONS_REGION)
     .runWith(RUNTIME_OPTS);
   ```

## Related Issues

- [GitHub Issue #1235](https://github.com/firebase/firebase-functions/issues/1235)
- Reported: September 19, 2022
- Status: Open (as of last update)

## Testing Locally

1. Start the Firebase emulator:
   ```bash
   npm run serve:functions
   ```

2. The console output will show the mutation happening in real-time.

3. You can also test the functions using the Firebase emulator UI at `http://localhost:4000`.

## Additional Notes

- This bug affects **v1 functions API** only
- The issue occurs when using `.runWith()` followed by `.region()`
- The mutation happens because objects are passed by reference in JavaScript
- The bug can cause deployment confusion where functions are detected in incorrect regions


