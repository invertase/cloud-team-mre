# MRE: firebase-functions issue #1558

**Issue**: [Firebase Blocking Auth Functions Run Incorrectly on Failed Signup](https://github.com/firebase/firebase-functions/issues/1558)

## Environment

| Requirement        | Value              |
| ------------------ | ------------------ |
| Node.js            | **22**             |
| firebase-functions | **^6.3.0** (see `functions/package.json`) |
| firebase-tools     | latest (or pin as needed) |
| Platform           | macOS              |

## Prerequisites

- Node.js 22 (e.g. `nvm use 22` if using nvm; see `.nvmrc` in this directory)
- A Firebase project with client config in `client/.env`
- Enable **Email/Password** sign-in in [Firebase Console](https://console.firebase.google.com) → your project → **Authentication** → **Sign-in method** → **Email/Password** → **Enable**. Otherwise the client will get `auth/operation-not-allowed`.
- Blocking functions require a [GCIP project](https://firebase.google.com/docs/auth/extend-with-blocking-functions#before-you-begin); enable Identity Platform if you see `Blocking Functions may only be configured for GCIP projects`.

## Steps to reproduce

1. Deploy functions from this MRE:

   ```bash
   cd functions
   npm install
   npm run build
   cd ..
   npx firebase deploy --only functions
   ```

2. Configure the React client with your Firebase project:

   ```bash
   cd client
   cp .env.example .env
   # Fill in real VITE_* values from Firebase Console.
   npm install
   npm run dev
   ```

3. Open the app (e.g. http://localhost:5173), click **Register user** once (success), then click **Register user** again (same email `user@example.com`). You should see `auth/email-already-in-use` on the second click.

4. Check **Cloud Functions logs** (Firebase Console → Functions → Logs, or `firebase functions:log`). On the second run, `beforeUserCreated` and `beforeUserSignedIn` should **not** fire (expected). In the bug, they **do** fire, sometimes with incorrect or nonexistent UIDs.

## Expected behavior

Blocking functions fire only when:

- **beforeUserCreated**: Before a new user is saved to Firebase Authentication and before a token is returned.
- **beforeUserSignedIn**: After credentials are verified but before an ID token is returned (creating a new user triggers both).

They must **not** fire when sign-up fails with `auth/email-already-in-use`.

## Actual behavior

Both `beforeUserCreated` and `beforeUserSignedIn` fire even when the client receives `Firebase: Error (auth/email-already-in-use)`, sometimes with random or nonexistent UIDs. Fast repeated attempts can in some cases create multiple users with the same email (see [issue comment](https://github.com/firebase/firebase-functions/issues/1558#issuecomment-2208958828)).
