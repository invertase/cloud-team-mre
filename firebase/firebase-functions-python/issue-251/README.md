# Firebase Functions Python Template MRE

This is a template Minimal Reproducible Example (MRE) for Firebase Functions Python. It demonstrates basic setup and common use cases.

## Prerequisites

- Python 3.9 or later
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Blaze plan (required for Functions)

## Setup

1. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
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

### HTTP Function
- Endpoint: `hello_world_v2`
- Type: HTTP Request
- Description: Returns a JSON response with a message and timestamp

### Firestore Trigger
- Function: `on_document_created_v2`
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
├── functions/
│   ├── main.py           # Main functions file
│   ├── requirements.txt  # Python dependencies
│   └── venv/             # Virtual environment for dependencies
├── firebase.json         # Firebase configuration
├── .firebaserc           # Firebase project configuration
└── README.md             # This file
```

## Common Issues

1. **Authentication**: Ensure you're logged in with `firebase login`
2. **Project Selection**: Verify correct project with `firebase use <project-id>`
3. **Billing**: Confirm Blaze plan is enabled for Functions
4. **Python Version**: Make sure you're using Python 3.9 or later
5. **Virtual Environment**: Always activate your virtual environment before installing dependencies
6. **Deploying Local Changes**: [This explains the steps to deploy local changes to the repository code to Firebase.](https://invertase.notion.site/Deploying-Local-Code-Changes-in-firebase-functions-firebase-functions-python-and-firebase-function-209d96ac9930801691e3c6b67a4d7cf7?pvs=74)

## Additional Resources

- [Firebase Functions Python Documentation](https://firebase.google.com/docs/functions/callable-reference)
- [Firebase Admin SDK Python Documentation](https://firebase.google.com/docs/admin/setup#python)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
