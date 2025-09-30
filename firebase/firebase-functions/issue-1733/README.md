# Firebase Functions Template MRE

This is a template Minimal Reproducible Example (MRE) for Firebase Functions. It demonstrates basic setup and common use cases.

## Prerequisites

- Node.js (v16 or later)
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Blaze plan (required for Functions)

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

## Included Examples

### v1 HTTP Function
- Endpoint: `helloWorld_v1`
- Type: HTTP Request
- Description: Returns a JSON response with a message and timestamp

### v1 Firestore Trigger
- Function: `onDocumentCreated_v1`
- Trigger: Document creation in 'collection'
- Description: Logs new document creation events

### v2 HTTP Function
- Endpoint: `helloWorld_v2`
- Type: HTTP Request
- Description: Returns a JSON response with a message and timestamp

### v2 Firestore Trigger
- Function: `onDocumentCreated_v2`
- Trigger: Document creation in 'collection'
- Description: Logs new document creation events

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
ts-template/
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