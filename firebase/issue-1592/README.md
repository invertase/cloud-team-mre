# MRE for Issue #1592: Microsoft emailVerified in auth.user().onCreate()

Minimum reproducible example for [firebase/firebase-functions#1592](https://github.com/firebase/firebase-functions/issues/1592).

**Bug:** When a user registers using the Microsoft authentication provider, `emailVerified` is returned as `false` in the `auth.user().onCreate()` trigger, even though the Microsoft account has a verified email. **Expected:** `emailVerified` should be `true` for Microsoft provider. **Note:** In the Auth emulator the field is correctly `true`; the bug appears with **deployed functions and production Firebase Auth**.

---

## Environment

| Component          | Version   |
| ------------------ | --------- |
| node               | 20 (LTS)  |
| firebase-functions | 5.0.1     |
| firebase-tools     | 13.11.2   |
| firebase-admin     | 12.2.0    |

The issue originally specified Node v18.20.3; Node 18 was decommissioned for Cloud Functions (2025-10-31), so this MRE uses Node 20 for deployment.

---

## Prerequisites

1. **Node 20**
   - Using nvm: `nvm install 20 && nvm use` (or ensure `.nvmrc` is used: `nvm use` in this directory).
2. **Firebase CLI 13.11.2**
   - `npm install -g firebase-tools@13.11.2`

---

## Steps to reproduce

### 1. Firebase project

1. Create a project in [Firebase Console](https://console.firebase.google.com/) (or use an existing one).
2. Go to **Authentication** > **Sign-in method**.
3. Enable **Microsoft**, **Google**, and **GitHub**. Google typically needs no extra config in the Console. Microsoft and GitHub need external app setup (see below).

### 2. Azure AD (Microsoft) app

1. In [Azure Portal](https://portal.azure.com/), go to **Microsoft Entra ID** (or Azure Active Directory) > **App registrations** > **New registration**.
2. Name the app (e.g. "MRE 1592"), choose supported account types, set redirect URI later.
3. After creation, go to **Certificates & secrets** and create a **New client secret**. Copy the secret value (you will need it in Firebase Console).
4. Go to **Authentication** > **Add a platform** > **Web**.
5. Add redirect URIs:
   - Production: `https://<your-project-id>.firebaseapp.com/__/auth/handler`
   - Local (optional, for emulator): `http://localhost:5173` (or your dev server origin) and `http://127.0.0.1:5173`
6. Copy the **Application (client) ID** and the **client secret** into Firebase Console > Authentication > Sign-in method > Microsoft (Client ID and Client Secret). Save.

**Google:** Enable the Google provider in Firebase Console. No client ID or secret is required for the default Google provider. Add your app’s domain to authorized domains if needed for production.

**GitHub:** In [GitHub](https://github.com/) go to **Settings** > **Developer settings** > **OAuth Apps** > **New OAuth App**. Set Authorization callback URL to `https://<your-project-id>.firebaseapp.com/__/auth/handler` (and optionally `http://localhost:5173` for the emulator). Copy the **Client ID** and generate a **Client secret**, then paste both into Firebase Console > Authentication > Sign-in method > GitHub. Save.

### 3. Backend (Firebase Functions)

From the repo root:

```bash
cd cloud-team-mre/firebase/issue-1592
firebase use <your-project-id>
cd functions
npm install
npm run build
```

**To reproduce the bug (production):**

```bash
firebase deploy --only functions
```

**Optional (emulator):** Run `npm run serve` from `functions/` (or `firebase emulators:start --only auth,functions` from this directory). In the emulator, signing in with Microsoft may show `emailVerified: true` in the triggered function; the issue is about **production** behavior.

### 4. Frontend (React client)

```bash
cd cloud-team-mre/firebase/issue-1592/client
cp .env.example .env
```

Edit `.env` and set your Firebase config (from Firebase Console > Project settings > General > Your apps > SDK setup and config):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Then:

```bash
npm install
npm run dev
```

Open the app in the browser (e.g. http://localhost:5173). Sign in with **Microsoft**, **Google**, or **GitHub** to compare `emailVerified` across providers.

### 5. Observe the bug

1. After each sign-in, the `onAuthUserCreate` function is triggered.
2. In [Firebase Console](https://console.firebase.google.com/) go to **Functions** > **Logs**, or run `firebase functions:log` from this directory.
3. Find the log entry for `auth.user().onCreate` and inspect the user payload.

**Comparison:** Sign in with **Google** or **GitHub** and check the logs: you should see `emailVerified: true` and `providerId` equal to `google.com` or `github.com`. Sign in with **Microsoft** (use a different email or delete the test user first): you will see `emailVerified: false` and `providerId: "microsoft.com"`. That demonstrates the bug is Microsoft-specific.

- **Actual (bug) for Microsoft:** `emailVerified: false` and `providerData` includes `providerId: "microsoft.com"`.
- **Expected:** `emailVerified: true` for Microsoft provider (same as Google/GitHub).

Example Microsoft payload (redact PII as needed):

```json
{
  "uid": "...",
  "email": "user@example.com",
  "emailVerified": false,
  "providerData": [{ "providerId": "microsoft.com", ... }]
}
```

---

## Emulator vs production

- **Emulator:** With `firebase emulators:start --only auth,functions`, signing in with Microsoft may show `emailVerified: true` in the triggered function (correct behavior).
- **Production:** With deployed functions and production Firebase Auth, the same flow yields `emailVerified: false` for Microsoft. This MRE is intended to reproduce that production behavior.

---

## Version checklist

Before reporting, confirm:

- [ ] node: 20 (`node -v`)
- [ ] firebase-functions: 5.0.1 (in `functions/package.json`)
- [ ] firebase-tools: 13.11.2 (`firebase --version` or devDependency in `functions/`)
- [ ] firebase-admin: 12.2.0 (in `functions/package.json`)

---

## Project layout

This MRE lives at `cloud-team-mre/firebase/issue-1592/` in the repo.

- `functions/` – Firebase Functions (v1 `auth.user().onCreate()`), exact versions from the issue.
- `client/` – Vite + React app with Firebase Auth and “sign-in via Microsoft, Google, and GitHub” for comparing `emailVerified` in auth.user().onCreate().
