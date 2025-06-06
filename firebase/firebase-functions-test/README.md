# Firebase Functions Test Environment

This is a template Minimal Reproducible Example (MRE) for Firebase Functions Test. It demonstrates basic setup and common use cases.

## Prerequisites

- Node.js (v16 or later)
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Blaze plan (required for Functions)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npm run test
   ```

## Templates Project Structure

```
js-template/
├── functions/
│   ├── src/
│   │   ├── index.js          # Main functions file
│   │   └── index.test.js     # Test file
│   ├── package.json          # Project dependencies
│   └── vitest.config.js      # Vitest configuration
├── firebase.json             # Firebase configuration
└── .firebaserc               # Firebase project configuration
```

```
ts-template/
├── functions/
│   ├── src/
│   │   ├── index.ts          # Main functions file
│   │   └── index.test.ts     # Test file
│   ├── package.json          # Project dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   └── vitest.config.js      # Vitest configuration
├── firebase.json             # Firebase configuration
└── .firebaserc               # Firebase project configuration
```

## Common Issues

1. **Authentication**: Ensure you're logged in with `firebase login`
2. **Project Selection**: Verify correct project with `firebase use <project-id>`
3. **Billing**: Confirm Blaze plan is enabled for Functions
4. **Emulator Issues**: If you encounter problems with the emulator, try:
   - Clearing the emulator cache: `firebase emulators:start --clear-cache`
   - Checking port availability
   - Ensuring all dependencies are installed

## Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Firebase Emulator Documentation](https://firebase.google.com/docs/emulator-suite)
