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

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase project (if not already done):
   ```bash
   firebase init functions
   ```

4. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

## Included Examples

### HTTP Function
- Endpoint: `helloWorld`
- Type: HTTP Request
- Description: Returns a JSON response with a message and timestamp

### Firestore Trigger
- Function: `onDocumentCreated`
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
template/
├── index.js          # Main functions file
├── package.json      # Project dependencies
└── README.md         # This file
```

## Common Issues

1. **Authentication**: Ensure you're logged in with `firebase login`
2. **Project Selection**: Verify correct project with `firebase use <project-id>`
3. **Billing**: Confirm Blaze plan is enabled for Functions

## Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli) 