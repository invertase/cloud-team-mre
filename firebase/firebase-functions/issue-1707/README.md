# MRE for firebase-functions #1707

Minimal reproducible example for [firebase/firebase-functions#1707](https://github.com/firebase/firebase-functions/issues/1707): logging object with `message` property.

## Bug summary

When calling `logger.info({ message: "Hello from Firebase v2!", test: "hello" })`, only the string `"Hello from Firebase v2!"` is logged instead of the full object.

## Version info (from issue)

| Dependency             | Version   |
| ---------------------- | --------- |
| **node**               | v20.9.0   |
| **firebase-functions** | 6.3.1     |
| **firebase-tools**     | 14.5.1    |
| **firebase-admin**     | 13.4.0    |

For exact reproduction, use Node 20.9.0 (e.g. `nvm use` if you have `.nvmrc`).

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
3. Trigger the HTTP function `logMessage` (invoke the deployed URL or emulator URL).
4. Check logs:
   ```bash
   npx firebase functions:log
   ```
   Or view in [Firebase Console](https://console.firebase.google.com) → Functions → Logs.

## Expected behavior

Log entry should show the full object in `jsonPayload`:

```json
{"message": "Hello from Firebase v2!", "test": "hello"}
```

## Actual behavior

Only the string `"Hello from Firebase v2!"` is logged (the `message` property is treated as the log message and the rest of the object is dropped).

## Project structure

```
issue-1707/
├── functions/
│   ├── index.ts       # logMessage function with logger.info({ message, test })
│   ├── package.json   # Pinned versions
│   └── tsconfig.json
├── .firebaserc
├── .nvmrc
├── firebase.json
└── README.md
```
