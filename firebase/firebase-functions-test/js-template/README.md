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
├── .firebaserc               # Firebase project configuration
└── README.md                 # This file
```

## Common Issues

1. **Authentication**: Ensure you're logged in with `firebase login`
2. **Project Selection**: Verify correct project with `firebase use <project-id>`
3. **Billing**: Confirm Blaze plan is enabled for Functions
4. **Deploying Local Changes**: [This explains the steps to deploy local changes to the repository code to Firebase.](https://invertase.notion.site/Deploying-Local-Code-Changes-in-firebase-functions-firebase-functions-python-and-firebase-function-209d96ac9930801691e3c6b67a4d7cf7?pvs=74)

## Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Firebase Emulator Documentation](https://firebase.google.com/docs/emulator-suite)
