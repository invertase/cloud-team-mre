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

# Cloud Functions v2 Direct VPC Egress Issue

This repository demonstrates an issue with Direct VPC egress configuration in Cloud Functions v2 when deployed through Firebase CLI.

## Issue Description

Cloud Functions v2 runs on Cloud Run infrastructure, which supports Direct VPC egress (no VPC connector needed). However, when deploying a Cloud Function v2 with `vpcConnectorEgressSettings: "PRIVATE_RANGES_ONLY"` using Firebase CLI, the VPC network configuration is not being applied properly.

The function is deployed without VPC access, showing "Network: None" in the GCP Console instead of the expected VPC configuration.

## Prerequisites

1. A Google Cloud project with:
   - Firebase CLI version 13.17.0 or later
   - Cloud Functions v2 enabled
   - A VPC network (the default VPC is fine)

2. Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```

3. Node.js 18 or later

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize your project:
   ```bash
   firebase use <your-project-id>
   ```

## Steps to Reproduce

1. Deploy the function:
   ```bash
   firebase deploy --only functions:testVpcFunction
   ```

2. Check the VPC configuration in GCP Console:
   - Go to Cloud Functions in GCP Console
   - Click on `testVpcFunction`
   - Go to the "Networking" tab
   - You'll see "Network: None" instead of the expected VPC configuration

## Expected Behavior

The function should be deployed with:
- Network: default
- Subnet: default
- Traffic routing: route only requests to private IPs to the VPC

## Actual Behavior

The function is deployed with:
- Network: None (VPC is not configured)

## Workaround

Since Cloud Functions v2 runs on Cloud Run infrastructure, you can configure Direct VPC egress directly on the underlying Cloud Run service:

```bash
gcloud run services update testVpcFunction \
  --project=YOUR_PROJECT_ID \
  --region=europe-west1 \
  --network=default \
  --subnet=default \
  --vpc-egress=private-ranges-only
```

This workaround:
- Configures true Direct VPC egress (no VPC connector needed)
- Persists across Firebase deployments
- Uses the default VPC network
- Only routes private IP traffic through the VPC

## Why This Matters

VPC access is needed when:
- Your function needs to access private resources (VMs, databases) in your VPC
- You want to restrict egress traffic to only private IP ranges
- You need to connect to on-premises resources through VPN/Interconnect
- You want to use Private Service Connect endpoints

## Root Cause (I think)

The Firebase CLI has a gap in its implementation in the function trigger parser:

```typescript
// In src/deploy/functions/runtimes/node/parseTriggers.ts
if (annotation.vpcConnector) {
  endpoint.vpc = { connector: annotation.vpcConnector };
  proto.renameIfPresent(endpoint.vpc, annotation, "egressSettings", "vpcConnectorEgressSettings");
}
```

The issue is that this code:
- Only configures VPC when a vpcConnector is specified
- Ignores vpcConnectorEgressSettings when used without a connector
- Doesn't support Direct VPC egress (connector-less VPC access)

The underlying Cloud Run infrastructure supports Direct VPC egress, but the Firebase CLI hasn't been updated to expose this capability. The parser needs to be updated to handle the case where vpcConnectorEgressSettings is specified without a vpcConnector.

## Related Resources

- [Cloud Run Direct VPC Egress Documentation](https://cloud.google.com/run/docs/configuring/vpc-direct-vpc)
- [Cloud Functions v2 Architecture](https://cloud.google.com/functions/docs/concepts/version-comparison)
- [Firebase Tools Source Code](https://github.com/firebase/firebase-tools/blob/6ec69e9cf0685c439e395e4cd96388f5dc06d28c/src/deploy/functions/runtimes/node/parseTriggers.ts) 