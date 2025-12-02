# Firebase Next.js Template

A ready-to-use template for building Next.js applications with Firebase Authentication and Hosting.

## Features

- Next.js 15.5.4 with App Router
- Firebase Authentication with Google Sign-in
- Firebase Hosting with Web Frameworks integration
- Cloud Functions (2nd Gen) automatically created for SSR
- Admin-protected routes (configurable)
- TypeScript support
- Tailwind CSS for styling

## Getting Started

Follow the steps in `setup_checklist.md` to get your project up and running.

## Project Structure

- `/hosting` - Next.js application
  - `/app` - App components, context, and utilities
  - `.env.local.sample` - Template for Firebase configuration

## Development Commands

- Local development: `cd hosting && npm run dev`
- Local Firebase server: `firebase serve --only hosting`
- Build for production: `cd hosting && npm run build`
- Deploy to preview: `firebase hosting:channel:deploy preview-1`
- Deploy to production: `firebase deploy --only hosting`

## Authentication

This template uses Firebase Authentication with Google Sign-in. The admin protection is bypassed in development mode but can be enabled for production.

## Known Issue: HTTP 409 Error on Redeployment

This project is configured to reproduce the HTTP 409 error issue when deploying Next.js to Firebase Hosting with Cloud Functions (2nd Gen).

### Issue Description

When using Firebase Web Frameworks integration for Next.js, repeated deployments can fail with HTTP 409 error when trying to update Cloud Functions (2nd Gen). The error occurs when a previous deployment operation is still queued or in progress.

### Error Message

```
⚠  functions: Request to https://cloudfunctions.googleapis.com/v2/projects/nextjs-app-name/locations/us-central1/functions/ssrnextjsappname?updateMask=... had HTTP Error: 409, unable to queue the operation
⚠  functions: failed to update function projects/nextjs-app-name/locations/us-central1/functions/ssrnextjsappname
```

### Reproduction Steps

1. **Initial Deployment**: Deploy Next.js app to Firebase Hosting
   ```bash
   npx firebase-tools deploy --only hosting
   ```

2. **Make Code Changes**: Modify any file in the `hosting/app` directory (e.g., update a component)

3. **Attempt Redeployment**: Try to redeploy immediately
   ```bash
   npx firebase-tools deploy --only hosting
   ```

4. **Expected Error**: The deployment should fail with HTTP 409 error if the previous Cloud Functions operation is still queued

### Current Workaround

- Wait 45-60 minutes for the stuck operation to timeout (as suggested in related issues)
- Check Cloud Functions status in Firebase Console before redeploying
- Use `firebase functions:list` to check for in-progress operations

### Related Issues

- [GitHub Issue #9343](https://github.com/firebase/firebase-tools/issues/9343) - HTTP 409 'unable to queue the operation' when deploying Next.js to Firebase Hosting
- [GitHub Issue #6582](https://github.com/firebase/firebase-tools/issues/6582) - Hosting deployment failing - HTTP Error: 409, unable to queue the operation
- [GitHub Issue #2126](https://github.com/firebase/firebase-tools/issues/2126) - 409 error while deploying to Firebase Hosting

### Configuration

This project uses:
- **Node.js**: v22.20.0 (specified in `.nvmrc` and `package.json` engines)
- **Next.js**: 15.5.4
- **Firebase Tools**: 14.20.0 (installed as devDependency)
- **Framework Backend**: Configured in `firebase.json` with `frameworksBackend.region: us-central1`
- **Cloud Functions**: Automatically created as 2nd Gen functions (e.g., `ssrnextjsappname`)

### Environment Setup

To ensure you're using the correct environment versions:

1. **Node.js**: Use Node v22.20.0
   ```bash
   # If using nvm
   nvm use
   # Or install/switch to v22.20.0
   nvm install 22.20.0
   nvm use 22.20.0
   ```

2. **Firebase Tools**: Install dependencies to get firebase-tools@14.20.0
   ```bash
   cd hosting
   npm install
   ```

3. **Verify versions**:
   ```bash
   node --version  # Should show v22.20.0
   npx firebase-tools --version  # Should show 14.20.0
   cd hosting && npm list next  # Should show 15.5.4
   ```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting/test-preview-deploy)
- [Firebase Web Frameworks](https://firebase.google.com/docs/hosting/frameworks/overview)


