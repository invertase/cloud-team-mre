# Firebase Functions MRE: Issue #1785

Reproduces: https://github.com/firebase/firebase-functions/issues/1785

Issue summary: a v2 HTTPS function configured with both `secrets` and a custom `serviceAccount` deploys successfully, but `secretValue.value()` throws at runtime:

```txt
No value found for secret parameter "functions-webhook-secret". A function can only access a secret if you include the secret in the function's dependency array.
```

## Versions

- Node.js: 22
- firebase-functions: 6.6.0
- firebase-admin: 13.6.0
- firebase-tools: 14.27.0

## Prerequisites

- Firebase project on Blaze plan
- `gcloud` authenticated for your project
- Firebase CLI (`npm i -g firebase-tools`) or use local `npx firebase` from this MRE

## Setup

1. Set your Firebase project in `.firebaserc`.
2. Install dependencies:

```bash
cd functions
npm install
cd ..
```

3. Create the secret:

```bash
gcloud secrets create functions-webhook-secret --replication-policy=automatic
printf "mre-secret-value" | gcloud secrets versions add functions-webhook-secret --data-file=-
```

4. Create a dedicated service account named `function`:

```bash
gcloud iam service-accounts create function --display-name="Function"
```

5. Grant that service account secret access:

```bash
gcloud secrets add-iam-policy-binding functions-webhook-secret --member="serviceAccount:function@<PROJECT_ID>.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
```

Replace `<PROJECT_ID>` with your project ID.

6. In `functions/index.js`, replace `REPLACE_WITH_PROJECT_ID` with your project ID.

## Repro Steps

1. Deploy:

```bash
npx firebase deploy --only functions:mailjetWebhook
```

2. Get the function URL:

```bash
gcloud run services describe mailjetwebhook --region=europe-west1 --format="value(status.url)"
```

3. Invoke:

```bash
curl -i "<SERVICE_URL>"
```

4. Check logs:

```bash
npx firebase functions:log --only mailjetWebhook
```

## Expected Behavior

The function logs the actual secret value (`mre-secret-value`).

## Actual Behavior

The function logs/throws:

```txt
No value found for secret parameter "functions-webhook-secret". A function can only access a secret if you include the secret in the function's dependency array.
```
