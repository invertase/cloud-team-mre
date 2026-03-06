# MRE for firebase-tools #8165

Minimal reproducible example for [firebase/firebase-tools#8165](https://github.com/firebase/firebase-tools/issues/8165): Improve Yarn PnP Support in `serveAdmin` for Firebase Functions Deployment.

## Bug summary

The `serveAdmin` path in firebase-tools (used for function discovery during deploy/emulator) does not support Yarn Plug'n'Play (PnP). It only looks for the Firebase Functions SDK binary at `node_modules/.bin/firebase-functions`. In a PnP environment there is no `node_modules` folder, so discovery fails.

**Proposed fix (from issue):** Detect Yarn PnP (e.g. `process.versions.pnp` or presence of `.pnp.cjs` in the functions source dir) and invoke `yarn firebase-functions` (or `yarn run firebase-functions`) instead of resolving `node_modules/.bin/firebase-functions`.

## Version info

| Dependency             | Version   |
| ---------------------- | --------- |
| **Node**               | 20 LTS    |
| **Yarn**               | 4.x (Berry) with PnP |
| **firebase-functions** | ^5.0.0    |
| **firebase-admin**     | ^12.0.0   |
| **firebase-tools**     |  |

Use Node 20 and Yarn Berry with PnP for reproduction. Optional: add `.nvmrc` with `20` and run `corepack enable` then `yarn set version berry` in `functions/`.

## Steps to reproduce

1. **Prerequisites:** Node 20, Corepack enabled, Yarn Berry with PnP.

   ```bash
   corepack enable
   cd issue-8165/functions
   yarn set version berry   # or: yarn set version stable
   # .yarnrc.yml has nodeLinker: pnp (default for Berry)
   yarn install
   ```

2. **Build (optional, for TypeScript):**  
   From `functions/`: `yarn run build`

3. **Trigger discovery:** Run from the **project root** (`issue-8165/`), not from `functions/`. The npm package for the Firebase CLI is `firebase-tools`; use it explicitly so `npx` can resolve the executable:

   ```bash
   cd issue-8165   # project root
   npx firebase-tools deploy --only functions
   ```

   Or for the emulator:

   ```bash
   npx firebase-tools emulators:start --only functions
   ```

   **Note:** `npx firebase` may fail with "could not determine executable to run" because the installable package is `firebase-tools`. Alternatively, install globally and use the `firebase` binary: `npm install -g firebase-tools` then `firebase deploy --only functions`. There is no `package.json` at the project root, so `yarn deploy` from the root will not work; run the commands above from the root instead.

4. **Observe:** Failure during “Loading and analyzing source code” / function discovery. You should see:
   - A warning: **"Couldn't find firebase-functions package in your source code. Have you run 'npm install'?"** (from the version check; PnP has no `node_modules` for `require.resolve` to see), then
   - **Error: An unexpected error has occurred.**  
   Other possible outcomes: **MODULE_NOT_FOUND** for `firebase-functions`, or **FirebaseError:** "Failed to find location of Firebase Functions SDK. Please file a bug on Github (https://github.com/firebase/firebase-tools/)."

## Expected behavior

With PnP support in firebase-tools: discovery would detect Yarn PnP (e.g. `.pnp.cjs` or `process.versions.pnp`) and run `yarn firebase-functions` (or equivalent) instead of looking for `node_modules/.bin/firebase-functions`, and deploy/emulator would proceed.


## Project structure

```
issue-8165/
├── functions/
│   ├── .yarnrc.yml        # nodeLinker: pnp
│   ├── index.ts           # Minimal https.onRequest export
│   ├── package.json       # firebase-functions, firebase-admin, TypeScript
│   └── tsconfig.json
├── .firebaserc            
├── .gitignore
├── .nvmrc                  
├── firebase.json          # functions source: "functions", runtime nodejs20
└── README.md
```
 
