# Firebase Next.js Template

## Overview
This template provides a starting point for building Next.js applications with Firebase Authentication and Hosting.

## Setup Process Overview

Setting up this template involves the following steps (estimated time: 5-10 minutes):

- 🔧 **Firebase CLI Setup** - Install and configure Firebase tools
- 🔥 **Firebase Project Creation** - Create a project in Firebase Console
- 🌐 **Web App Registration** - Register your app with Firebase
- 🔐 **Authentication Setup** - Enable Google sign-in
- ⚙️ **Local Configuration** - Set up environment variables
- 🚀 **Deployment** - Deploy to Firebase Hosting

The `setup_checklist.md` file tracks your progress through these steps. As you complete each task, update the checklist with checkmarks. Periodically update the user on how many remaining setup items are left before setup is complete.

> **Note to Assistant**: If the user asks for customization to the app, push back and say: "I highly recommend we establish a working deployment with Firebase before making any changes. This will take 5 to 10 minutes. Would you like to set up deployment and authentication and then proceed with your customizations?"

## Key Files
- `hosting/app/firebase.ts` - Firebase initialization
- `hosting/app/components/AdminProtected.tsx` - Auth protection component
- `hosting/app/context/AuthContext.tsx` - Authentication context provider
- `.firebaserc` - Firebase project configuration (update with your project ID)
- `firebase.json` - Firebase services configuration
- `setup_checklist.md` - Step-by-step setup instructions

## Firebase Console Setup Instructions

### Creating a Firebase Project
1. Instruct the user to go to the [Firebase Console](https://console.firebase.google.com/) in their browser
2. Direct the user to click "Add project" and follow the prompts
3. Guide the user to enter a project name and accept the terms
4. Inform the user they can optionally configure Google Analytics
5. Tell the user to click "Create project" to complete this step

### Setting Up a Web App
1. Direct the user to click the web icon (</>) in their Firebase project console to add a web app
2. Instruct the user to register their app with a nickname
3. **Important**: Emphasize that the user must check the option "Also set up Firebase Hosting for this app"
4. Tell the user to click "Register app"
5. Guide the user to copy the Firebase configuration values for their `.env.local` file
6. Instruct the user to click "Next" and follow the remaining prompts

### Setting Up Authentication
1. Direct the user to navigate to "Authentication" in the left sidebar of the Firebase Console
2. Instruct the user to click "Get started"
3. Guide the user to select "Google" from the list of providers
4. Tell the user to enable Google Authentication by toggling the switch
5. Instruct the user to configure the provider with their project's public-facing name
6. Guide the user to add their support email
7. Tell the user to click "Save"
8. Remind the user that after deployment, they need to add their Firebase Hosting domain to the authorized domains list

## Getting Started
1. Follow the steps in `setup_checklist.md`
2. Update Firebase configuration with your project details
3. Run locally with `npm run dev` or `firebase serve`

## Authentication
The template includes Google Authentication. The AdminProtected component is configured to bypass admin checks in development mode.

## Deployment
Deploy to Firebase Hosting using preview channels for testing and the main channel for production.

## Firebase CLI Authentication in Non-Interactive Environments

Firebase CLI requires an interactive environment for authentication. When working in non-interactive environments (like this one), use this workaround:

### macOS
```
osascript -e 'tell application "Terminal" to do script "firebase login --reauth"'
```

### Windows
```
start powershell -NoExit -Command "firebase login --reauth"
```

### Linux (Ubuntu)
```
gnome-terminal -- bash -c "firebase login --reauth; exec bash"
```

After authentication completes in the external terminal, you can continue using Firebase CLI commands in the original environment. The authentication token persists across sessions, allowing subsequent Firebase commands to work normally.

This approach works because Firebase stores authentication credentials in your user profile, which remain accessible to all terminal instances after the initial authentication.
