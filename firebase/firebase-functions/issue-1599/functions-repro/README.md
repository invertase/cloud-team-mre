# firebase/firebase-functions#1599 MRE

This is a Minimal Reproducible Example (MRE) for [firebase/firebase-functions#1599](https://github.com/firebase/firebase-functions/issues/1599)

## Prerequisites

- Node.js (22.6.0)
- Firebase CLI (13.15.2) 
- Firebase Functions (5.0.1)
- Firebase Admin (12.3.1)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Login to Firebase:
   ```bash
   firebase login
   ```

4. Initialize Firebase project (if not already done):
   ```bash
   firebase init functions
   ```

5. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

## Testing Locally

1. Start the Firebase emulator:
   ```bash
   firebase emulators:start
   ```

2. Test the HTTP function:
   ```bash
   curl http://localhost:5001/<project-id>/<region>/helloWorld
   ```

## Project Structure

```
functions-repro/
├── functions/         # Firebase Functions directory
│   ├── index.ts      # Main functions file
│   ├── package.json  # Project dependencies
│   └── tsconfig.json # TypeScript configuration
├── .firebaserc       # Firebase project configuration
├── firebase.json     # Firebase configuration
└── README.md         # This file
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