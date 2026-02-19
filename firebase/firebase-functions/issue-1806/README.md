# MRE for [firebase/firebase-functions#1806](https://github.com/firebase/firebase-functions/issues/1806)

Minimal reproducible example for the v2 barrel export re-exporting v1 config, which causes the emulator to throw in firebase-functions v7.

## Environment

| Item               | Value  |
| ------------------ | ------ |
| firebase-functions | 7.0.3  |
| firebase-tools     | 15.4.0 |
| Node.js            | 22     |
| Platform           | macOS  |

## Prerequisites

- Node.js 22
- Firebase CLI 15.4.0 (or compatible). Install globally or use `npx firebase`.
- npm

If you need a real Firebase project for the emulator (e.g. to avoid prompts), run `firebase use <project-id>` or set the default in `.firebaserc` (this MRE uses a placeholder `demo-project`).

## Steps to Reproduce

_(These match the issue author’s steps.)_

1. Install and build:
   ```bash
   cd functions && npm install && npm run build
   ```

2. From the project root (`issue-1806/`), start the functions emulator:
   ```bash
   firebase emulators:start --only functions
   ```

## Expected vs Actual

- **Expected**: The emulator starts; importing from `firebase-functions/v2` does not load v1 config.
- **Actual**: The emulator fails with the error above because the v2 barrel (`firebase-functions/v2/index.js`) re-exports `config` from `../v1/config.js`, so loading the barrel loads v1 config, which throws in v7.

## Workaround

Import from the specific subpath instead of the barrel:

```ts
// Instead of: import { https } from 'firebase-functions/v2';
import { onCall } from 'firebase-functions/v2/https';
import type { CallableRequest } from 'firebase-functions/v2/https';

export const withGuard = onCall(async (request: CallableRequest) => {
  return { message: 'ok' };
});
```

## Project Structure

```
issue-1806/
├── README.md
├── firebase.json
├── .firebaserc
└── functions/
    ├── index.ts             
    ├── package.json
    └── tsconfig.json
```
