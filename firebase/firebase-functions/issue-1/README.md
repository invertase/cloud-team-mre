# Firebase Functions Issue #1 MRE

Issue URL: https://github.com/CorieW/firebase-functions/issues/1

This MRE demonstrates that `onMessagePublished` rejects `StringParam` for `topic`.

## Repro snippet

```ts
import { defineString } from "firebase-functions/params";
import { onMessagePublished } from "firebase-functions/v2/pubsub";

const topicName = defineString("some-topic");

export const myMessageConsumer = onMessagePublished(
  {
    topic: topicName
  },
  async (message) => {
    console.log(message);
  }
);
```

## Variant A: reported versions

Path: `reported-versions`

Installed versions:
- node: `v23.7.0` (local environment)
- firebase-functions: `7.0.1`
- typescript: `5.9.3`

Run:

```bash
npm install
npm run check
```

Result:
- Fails with `TS2769`
- `Type 'StringParam' is not assignable to type 'string'`

## Variant B: current versions

Path: `current-versions`

Installed versions:
- node: `v23.7.0` (local environment)
- firebase-functions: `7.2.2`
- typescript: `6.0.2`

Run:

```bash
npm install
npm run check
```

Result:
- Fails with `TS2769`
- `Type 'StringParam' is not assignable to type 'string'`

## Expected behavior

`topic` should accept deploy-time params (for example, `defineString(...)`) and resolve at deploy time.

## Actual behavior

Type-checking fails before deploy because `topic` is typed as `string`.
