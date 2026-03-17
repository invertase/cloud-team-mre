# Firebase Functions Issue #1135 MRE

This MRE reproduces [firebase/firebase-functions#1135](https://github.com/firebase/firebase-functions/issues/1135): `sessionClaims` (and `customClaims`) returned from `beforeSignIn` do not appear in decoded ID token claims.

## Scope

- Uses an auth blocking function (`beforeSignIn`) that returns:
  - `displayName`
  - `customClaims`
  - `sessionClaims`
- Uses a minimal web app with `signInWithPopup` and `getIdTokenResult(true)` to inspect decoded claims.

## Versions (latest test run on March 17, 2026)

- `firebase-functions` `7.2.0`
- `firebase-admin` `13.7.0`
- `firebase-tools` `15.10.1`

Original issue report versions were Node `16.14.0`, `firebase-functions` `3.21.2`, `firebase-admin` `10.2.0`, `firebase-tools` `10.7.1`.

## Prerequisites

1. A Firebase project with **Identity Platform** enabled.
2. Auth blocking functions enabled for the project.
3. Google sign-in provider enabled in Firebase Authentication.
4. Add your test domain to Auth authorized domains (at minimum `localhost`):
   Firebase Console -> Authentication -> Settings -> Authorized domains.
5. Update `./.firebaserc` and `./web/firebase-config.js` to your project values.

## Setup

1. Install Functions dependencies:
```bash
cd functions
npm install
cd ..
```

2. Deploy Functions + Hosting:
```bash
npx firebase deploy --only functions,hosting
```

3. Open the Hosting URL shown by Firebase CLI.

## Repro Steps

1. Click `Sign in with Google`.
2. Complete the popup flow.
3. Inspect the on-page output (and browser console) for `idTokenResult.claims`.

## Expected Behavior

- `beforeSignIn` runs.
- Returned claims from the function response are present in decoded token claims:
  - `fromBeforeSignIn`
  - `signInIpAddress`

## Actual Behavior (Issue #1135)

- `beforeSignIn` runs and updates `displayName`.
- Returned `customClaims` / `sessionClaims` are not present in decoded `idTokenResult.claims`.

## Files

- `functions/index.js`: blocking function implementation
- `web/index.html`: minimal sign-in client
- `web/firebase-config.js`: project config placeholder
