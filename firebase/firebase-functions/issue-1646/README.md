# MRE for firebase-functions #1646

Minimal reproducible example for [firebase/firebase-functions#1646](https://github.com/firebase/firebase-functions/issues/1646): Firebase HTTP functions cannot accept URLs with encoding other than UTF-8 (e.g. Windows-1252, ISO-8859-1).

## Bug summary

When the request URL path or query contains non-UTF-8 encoded characters (e.g. `%C3`), the function returns an internal server error instead of handling the request or returning 400 Bad Request. Error observed: "No default engine was specified and no extension was provided."

A maintainer (CorieW) also reproduced with a minimal v2 `https.onRequest` handler that only calls `res.send('Hello from Firebase!')`.

## Version info (from issue)

| Dependency             | Version   |
| ---------------------- | --------- |
| **node**               | v20.11.0  |
| **firebase-functions** | 4.9.0     |
| **firebase-tools**     | 13.25.0   |
| **firebase-admin**     | 12.0.0    |

Use Node 20.11.0 for exact reproduction (e.g. `nvm use` with `.nvmrc`).

## Steps to reproduce

1. From this directory:
   ```bash
   cd functions && npm install && npm run build
   ```
2. Deploy (or run emulator):
   ```bash
   npx firebase deploy --only functions
   ```
   Or locally:
   ```bash
   npm run serve:functions
   ```
3. Trigger the function with a URL that contains non-UTF-8 encoding, e.g.:
   - Path: `https://<project>-<region>.cloudfunctions.net/newapp/%C3`
   - Or Cloud Run URL (2nd gen): `https://<service>-<hash>-an.a.run.app/%C3`
   Use HTTP Basic Auth when prompted: username `username`, password `passwd ` (with trailing space).
4. Observe: internal server error ("No default engine was specified and no extension was provided") instead of 400 or normal handling.

For a normal request (no invalid encoding), e.g. `GET /` with valid auth, the function should return 200 and serve the static file.

## Expected behavior

Function either handles the request or returns 400 Bad Request when the URL contains invalid/non-UTF-8 encoding.

## Actual behavior

Internal server error: "No default engine was specified and no extension was provided."

## Project structure

```
issue-1646/
├── functions/
│   ├── index.ts         # Express app + functions.https.onRequest (v1)
│   ├── static/
│   │   └── index.html
│   ├── package.json     # Pinned versions
│   └── tsconfig.json
├── .firebaserc
├── .nvmrc
├── firebase.json
└── README.md
```
