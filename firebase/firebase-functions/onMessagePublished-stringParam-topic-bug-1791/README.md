# Cannot use StringParam as topic value in onMessagePublished

## Issue Description

**GitHub Issue**: [firebase/firebase-functions#1791](https://github.com/firebase/firebase-functions/issues/1791)

**Status**: Open

## Problem Summary

The `onMessagePublished` function from `firebase-functions/v2/pubsub` does not accept `StringParam` (from `firebase-functions/params`) as the `topic` value in its options, unlike other function types that support parameters in their options.

When attempting to use a `StringParam` for the topic, TypeScript throws a compilation error:

```
error TS2769: No overload matches this call.
Type 'StringParam' is not assignable to type 'string'.
```

## Root Cause

The `PubSubOptions` interface defines `topic` as `string` only:

```typescript
export interface PubSubOptions extends options.EventHandlerOptions {
  topic: string;  // ← Only accepts string, not Expression<string>
  // ... other options
}
```

However, other function types (like `onRequest` in HTTPS functions) accept `Expression<string>` in their options, which includes `StringParam`. For example:

```typescript
// HTTPS functions support Expression<string> for serviceAccount
serviceAccount?: string | Expression<string> | ResetValue;

// But PubSubOptions.topic only accepts string
topic: string;  // ← Missing Expression<string> support
```

The `topic` field should accept `string | Expression<string>` to be consistent with other options like `serviceAccount` and `region`.

## Prerequisites

- Node.js v20.10.0
- Firebase CLI (firebase-tools) v15.1.0
- Firebase project with Blaze plan (required for Functions)
- TypeScript 5.7.3+

## Setup Instructions

### 1. Configure Firebase Project

Update `.firebaserc` with your Firebase project ID:

```json
{
  "projects": {
    "default": "YOUR_PROJECT_ID"
  }
}
```

### 2. Install Dependencies

```bash
cd functions
npm install
```

### 3. Build the Project

```bash
npm run build
```

## Reproduction Steps

### Step 1: Attempt to Use StringParam

The code in `functions/src/index.ts` demonstrates the issue:

```typescript
import { defineString } from "firebase-functions/params";
import { onMessagePublished } from "firebase-functions/v2/pubsub";

const topicName = defineString("some-topic");

// This causes TypeScript error TS2769
export const myMessageConsumer = onMessagePublished(
  {
    topic: topicName,  // ← StringParam not assignable to string
  },
  async (message) => {
    console.log(message);
  }
);
```

### Step 2: Observe TypeScript Error

When you run `npm run build`, you will see:

```
src/index.ts:6:34 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(topic: string, handler: (event: CloudEvent<MessagePublishedData<any>>) => any): CloudFunction<CloudEvent<MessagePublishedData<any>>>', gave the following error.
    Argument of type '{ topic: StringParam; }' is not assignable to parameter of type 'string'.
  Overload 2 of 2, '(options: PubSubOptions, handler: (event: CloudEvent<MessagePublishedData<any>>) => any): CloudFunction<CloudEvent<MessagePublishedData<any>>>', gave the following error.
    Type 'StringParam' is not assignable to type 'string'.

  6 export const myMessageConsumer = onMessagePublished(
                                     ~~~~~~~~~~~~~~~~~~~
  7     {
    ~~~~~
... 
 12     }
    ~~~~~
 13 );
    ~

  node_modules/firebase-functions/lib/v2/providers/pubsub.d.ts:86:5
    86     topic: string;
           ~~~~~
    The expected type comes from property 'topic' which is declared here on type 'PubSubOptions'
```

### Step 3: Compare with Working Example

The file also includes a working example using a plain string:

```typescript
// This works correctly
export const workingMessageConsumer = onMessagePublished(
  {
    topic: "some-topic",  // ← Plain string works
  },
  async (message) => {
    console.log(message);
  }
);
```

## Expected vs Actual Behavior

### Expected Behavior

- `onMessagePublished` should accept `StringParam` (or `Expression<string>`) for the `topic` option
- This would be consistent with other function types that support parameters in their options
- The parameter should be resolved at deployment time, similar to how `serviceAccount` and `region` work

### Actual Behavior

- TypeScript compilation fails with error TS2769
- `StringParam` is not assignable to `string`
- Only plain strings are accepted for the `topic` option
- This prevents using parameterized topic names, which is useful for multi-environment deployments

## Comparison with Other Function Types

Other function types in Firebase Functions v2 support `Expression<string>` in their options:

### HTTPS Functions (`onRequest`)

```typescript
export interface HttpsOptions {
  serviceAccount?: string | Expression<string> | ResetValue;  // ✅ Supports Expression<string>
  region?: string | Expression<string> | ResetValue;         // ✅ Supports Expression<string>
  // ...
}
```

### Event Handler Options

```typescript
export interface EventHandlerOptions {
  serviceAccount?: string | Expression<string> | ResetValue;  // ✅ Supports Expression<string>
  region?: string | Expression<string> | ResetValue;         // ✅ Supports Expression<string>
  // ...
}
```

### PubSub Options (Current - Broken)

```typescript
export interface PubSubOptions extends EventHandlerOptions {
  topic: string;  // ❌ Only accepts string, missing Expression<string>
  // ...
}
```

### PubSub Options (Expected - Fixed)

```typescript
export interface PubSubOptions extends EventHandlerOptions {
  topic: string | Expression<string>;  // ✅ Should accept Expression<string>
  // ...
}
```

## Workaround

Currently, the only workaround is to use a plain string for the topic:

```typescript
// Workaround: Use plain string instead of StringParam
export const myMessageConsumer = onMessagePublished(
  {
    topic: "some-topic",  // Must be a literal string
  },
  async (message) => {
    console.log(message);
  }
);
```

This means you cannot parameterize topic names for different environments without code changes.

## Impact

- **Multi-environment deployments**: Cannot use different topic names per environment without code changes
- **Configuration management**: Cannot leverage Firebase Functions parameters for topic configuration
- **Inconsistency**: Different behavior compared to other function types that support parameters
- **Developer experience**: TypeScript errors prevent compilation, blocking deployment

## Proposed Fix

Update the `PubSubOptions` interface in `firebase-functions/src/v2/providers/pubsub.ts`:

```typescript
export interface PubSubOptions extends options.EventHandlerOptions {
  /** The Pub/Sub topic to watch for message events */
  topic: string | Expression<string>;  // ← Add Expression<string> support
  
  // ... rest of options
}
```

And update the implementation to handle `Expression<string>` when resolving the topic value, similar to how other options are handled.

## Environment

- **Node.js**: v20.10.0
- **firebase-functions**: v7.0.1
- **firebase-tools**: v15.1.0
- **TypeScript**: ^5.7.3

## Project Structure

```
onMessagePublished-stringParam-topic-bug-1791/
├── functions/
│   ├── src/
│   │   └── index.ts          # Test case demonstrating the bug
│   ├── package.json          # Dependencies with exact versions
│   └── tsconfig.json         # TypeScript configuration
├── firebase.json             # Firebase configuration
├── .firebaserc               # Firebase project configuration
└── README.md                 # This file
```

## Additional Resources

- [Firebase Functions Parameters Documentation](https://firebase.google.com/docs/functions/config-env)
- [Pub/Sub Functions Documentation](https://firebase.google.com/docs/functions/pubsub-events)
- [GitHub Issue #1791](https://github.com/firebase/firebase-functions/issues/1791)
