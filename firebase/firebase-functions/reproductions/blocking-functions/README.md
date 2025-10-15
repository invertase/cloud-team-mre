# Blocking Functions API Issue

This demonstrates a bug in the Identity Toolkit REST API where setting blocking function triggers returns success but doesn't actually configure the triggers.

## The Issue

The Identity Toolkit REST API provides a successful repsonse stating that the blocking functions have been set via the API, a resulting check discovers they have not been set even when correctly defined.

This test demonstrates the correct way to configure blocking function triggers and shows what happens with incorrect event type names.

## Required Functions

The test expects these functions to be deployed:

- `beforeCreate` (beforeUserCreated trigger)
- `beforeSignIn` (beforeUserSignedIn trigger)

Both functions must be deployed to the `us-central1` region. The test script will construct the function URIs automatically.

## Setup

1. Ensure you're authenticated with Firebase CLI:

   ```bash
   firebase login
   ```

2. Select your Firebase project:

   ```bash
   firebase use your-project-id
   ```

3. Download service account key:

   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccount.json` in this directory

4. Deploy the functions:

   ```bash
   cd functions
   npm install
   npm run build
   cd ..
   firebase deploy --only functions
   ```

## Running the Test

```bash
node test-api.js
```

## Cleanup

After testing, remove the blocking function configuration:

```bash
node cleanup.js
```

## Expected Behavior

### With Correct Event Types (`beforeCreate`, `beforeSignIn`)

- ✓ API call to set triggers returns 200 OK
- ✓ API call to get config shows triggers are properly configured
- x The correct update does not get applied for the blocking functions in GCP

## What This Shows

The Identity Toolkit API works correctly when using the proper event type names. The confusion comes from documentation and examples that use incorrect event type names (`beforeUserCreated`, `beforeUserSignedIn` instead of `beforeCreate`, `beforeSignIn`). Additonally, the correct variables are not updated in GCP when the correct configuration has been provided.
