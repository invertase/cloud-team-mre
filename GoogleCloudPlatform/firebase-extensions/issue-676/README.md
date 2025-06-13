# MRE for Issue #676

This example demonstrates how to reproduce Issue [#676](https://github.com/GoogleCloudPlatform/firebase-extensions/issues/676) using Firebase Extensions.

## Prerequisites

* Node.js and Firebase CLI installed
* An existing or new Firebase project


## Setup

1. Add the Firestore Vector Search extension to your manifest:
   ```bash
   firebase ext:install googlecloud/firestore-vector-search --project=your-project-id
   ```


2. Deploy the extension instances declared in your manifest:

   ```bash
   firebase deploy --only extensions --project=your-project-id
   ```
