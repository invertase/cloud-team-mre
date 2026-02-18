# MRE for firebase-tools issue #6499

**Issue:** [Firebase Emulator simply does not initialize .env || .env.local || .env.default](https://github.com/firebase/firebase-tools/issues/6499)

Minimum reproducible example using the exact environment and versions reported by the issue author.

This MRE lives at `cloud-team-mre/firebase-tools/issue-6499/` in the repo.

## Environment (from issue #6499)

| Dependency             | Version  |
| ---------------------- | -------- |
| **node**               | v14.17.6 |
| **firebase-functions**| 3.20.1   |
| **firebase-tools**     | 10.6.0   |
| **firebase-admin**     | 10.1.0   |

**Note:** `.env.default` is not a supported filename in firebase-tools. Only `.env`, `.env.<projectId>`, `.env.<alias>`, and `.env.local` are loaded. This MRE uses `.env` and `.env.local` only.

## Steps to reproduce

1. **Use Node v14.17.6**
   ```bash
   cd cloud-team-mre/firebase-tools/issue-6499
   nvm use
   # or: nvm install 14.17.6 && nvm use 14.17.6
   node -v   # should show v14.17.6
   ```

2. **Install Firebase CLI 10.6.0**
   ```bash
   npm install -g firebase-tools@10.6.0
   firebase --version   # should show 10.6.0
   ```
   Or use without global install: `npx firebase-tools@10.6.0` in the commands below.

3. **Install function dependencies**
   ```bash
   cd functions && npm install && cd ..
   ```

4. **Start the Functions emulator**
   ```bash
   firebase emulators:start --only functions
   ```
   (If using npx: `npx firebase-tools@10.6.0 emulators:start --only functions`)

5. **Trigger the HTTP function**
   - Note the URL printed by the emulator (e.g. `http://127.0.0.1:5001/demo-test-project/us-central1/logEnv`).
   - Open it in a browser or:
   ```bash
   curl "http://127.0.0.1:5001/demo-test-project/us-central1/logEnv"
   ```

6. **Check emulator logs**
   - Look for lines like:
     - `[MRE 6499] At module load, custom env vars: ...`
     - `[MRE 6499] Inside request handler, custom env vars: ...`

## Expected behavior

- `process.env` is populated with values from `functions/.env` and `functions/.env.local`.
- Logs should show something like:
  - `"PLANET":"Earth"`
  - `"AUDIENCE":"LocalHumans"` (from .env.local, overriding .env)
  - `"MY_CUSTOM_VAR":"from_dotenv_local"`
- The HTTP response body also echoes these values in `customEnvAtHandler`.

## Actual behavior (bug)

- `.env` values are nowhere to be found in `process.env`.
- Logs show:
  - `"PLANET":"<missing>"`, `"AUDIENCE":"<missing>"`, `"MY_CUSTOM_VAR":"<missing>"`.
- The HTTP response shows the same missing values.

## Project layout

```
cloud-team-mre/firebase-tools/issue-6499/
├── .nvmrc
├── README.md
├── firebase.json
├── .firebaserc
└── functions/
    ├── package.json      # firebase-functions@3.20.1, firebase-admin@10.1.0
    ├── .env              # PLANET=Earth, AUDIENCE=Humans, MY_CUSTOM_VAR=from_dotenv
    ├── .env.local        # AUDIENCE=LocalHumans, MY_CUSTOM_VAR=from_dotenv_local
    └── index.js          # HTTP function that logs process.env
```

## Optional: run against current firebase-tools

To check if the bug still exists in a newer firebase-tools (e.g. 15.x) built from source:

1. Build firebase-tools: from the firebase-tools repo run `npm run build`.
2. From this MRE root (`cloud-team-mre/firebase-tools/issue-6499`):
   ```bash
   node /path/to/firebase-tools/lib/bin/firebase.js emulators:start --only functions
   ```
3. Trigger the function and compare logs.
