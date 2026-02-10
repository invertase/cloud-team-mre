# MRE: Firebase Cloud Functions deploy failure with pnpm (issue #5911)

Minimal reproducible example for [firebase/firebase-tools#5911](https://github.com/firebase/firebase-tools/issues/5911) — Requesting Cloud Functions for Firebase to support pnpm workspaces.

## Issue summary

Deploying Cloud Functions fails when the project uses pnpm and a `pnpm-lock.yaml` exists in the functions directory. The proposed fix (adding `@google-cloud/functions-framework`) does not resolve the error. Removing `pnpm-lock.yaml` in the functions folder allows deploy to succeed.

## Environment (from issue)

- **firebase-tools**: 12.2.1 (for exact repro; current CLI can also be used to check if the behavior still exists)
- **Platform**: Linux Mint 21.1 (repro can be run on other platforms; issue was reported on Linux)

## Prerequisites

- Node.js 20 (Node 18 was decommissioned for Cloud Functions on 2025-10-30; this MRE uses Node 20 for deploy)
- [pnpm](https://pnpm.io/) installed
- [Firebase CLI](https://firebase.google.com/docs/cli) installed
- A Firebase project on the **Blaze** plan with **Functions** enabled

## Steps to reproduce

1. **Create a new project** in the [Firebase console](https://console.firebase.google.com/) and enable Cloud Functions.

2. **Use this MRE**: Clone or copy this directory (the repo root is `issue-5911/`).

3. **Install dependencies from repo root** (installs the workspace and creates the single root lockfile):
   ```bash
   cd issue-5911
   pnpm install
   ```

4. **Configure the Firebase project**: Edit `.firebaserc` and set `"default"` to your project ID, or run:
   ```bash
   firebase use <your-project-id>
   ```

5. **Deploy the function** (from repo root). The predeploy hook runs `pnpm --dir functions install --ignore-workspace` to generate a standalone `functions/pnpm-lock.yaml` that matches `functions/package.json`, so the buildpack gets a matching lockfile:
   ```bash
   firebase deploy --only functions:bigben
   ```
   Or: `pnpm run deploy`

   For parity with the original report (firebase-tools 12.2.1):
   ```bash
   npx firebase-tools@12.2.1 deploy --only functions:bigben
   ```

## Expected behavior

Functions deploy successfully.

## Actual behavior

Build fails with:

```
Build failed: This project is using pnpm but you have not included the Functions Framework in your dependencies. Please add it by running: 'pnpm add @google-cloud/functions-framework'.; Error ID: 5b6dc8b5

Functions deploy had errors with the following functions:
	bigben(us-central1)
```

- Adding `@google-cloud/functions-framework` to dependencies does **not** fix the issue.
- Removing `functions/pnpm-lock.yaml` (and using npm or no lockfile for install) allows deploy to succeed.

## Project structure

```
issue-5911/
├── .firebaserc
├── firebase.json
├── package.json           # root package (private)
├── pnpm-workspace.yaml    # workspace: packages: ['functions']
├── pnpm-lock.yaml         # single lockfile (from pnpm install at root)
├── README.md
└── functions/
    ├── index.js
    ├── package.json       # workspace package
    └── pnpm-lock.yaml     # generated at predeploy (standalone, matches package.json; 
```

The single exported function is **bigben** (HTTP), as referenced in the original issue.
