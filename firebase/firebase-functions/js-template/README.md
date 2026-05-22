# Issue 1888 Reproduction

This directory documents a minimal reproduction for firebase-functions issue `#1888`.

The reproduction shows that `onCallGenkit` does not forward the underlying callable request or a usable disconnect signal into the Genkit flow context. Because of that, a long-running flow can keep working after the client has already disconnected.

## What The Repro Demonstrates

The repro proves two separate things.

1. The Genkit flow context does not contain `rawRequest`.
2. The Genkit flow context does not contain a usable client-disconnect signal.

It also shows the runtime consequence.

- The client aborts early.
- The server-side flow keeps running through repeated silent-work steps.
- The disconnect is only noticed later at the outer HTTP response layer.

That makes this a real runtime bug, not just a missing convenience field.

## Pieces Of The Repro

The repro has two parts.

1. A deployed `onCallGenkit` callable function with explicit logging.
2. A Node script that opens the callable as a streaming SSE request and aborts after a short delay.

## Server Function Requirements

The deployed function should do all of the following:

- log whether `context.rawRequest` exists
- log whether any disconnect signal exists in the Genkit flow context
- perform repeated silent work with a delay between iterations
- stream a chunk after each silent phase
- log progress before and after each silent phase

The silent phase is the important part. If the client disconnects during that phase, the flow should ideally be able to stop. The bug is that `onCallGenkit` does not expose a signal the flow can use for that.

## Client Script

The client script used for the repro lives in the firebase-functions repo at:

- `scripts/repro-oncallgenkit-disconnect.mjs`

It sends a direct callable HTTP request with:

- `Content-Type: application/json`
- `Accept: text/event-stream`

Then it aborts the client after a configurable delay.

## How To Run The Repro

### 1. Deploy the instrumented function

Deploy the callable function export named `issue1888`.

### 2. Run the client script

From the firebase-functions repo:

```bash
FIREBASE_PROJECT_ID=your-project-id \
FIREBASE_FUNCTIONS_REGION=us-central1 \
ABORT_AFTER_MS=5000 \
TOTAL_STEPS=30 \
STEP_DELAY_MS=2000 \
npm run repro:oncallgenkit-disconnect
```

Or point directly at the deployed function URL:

```bash
FUNCTION_URL=https://us-central1-your-project-id.cloudfunctions.net/issue1888 \
ABORT_AFTER_MS=5000 \
TOTAL_STEPS=30 \
STEP_DELAY_MS=2000 \
npm run repro:oncallgenkit-disconnect
```

## Expected Client Behavior

The client should:

- begin the streaming request
- receive one or more SSE messages
- abort after about 5 seconds
- report that the abort was observed on the client side

The exact number of received chunks is not the key signal.

## Expected Server Logs

A successful reproduction looks like this:

- `hasRawRequest: false`
- `hasSignal: false`
- `rawRequest? undefined`
- `response signal? undefined`
- repeated progress logs such as:
  - `before silent work step=N`
  - `after silent work step=N`
- progress continues well past the client abort point
- later, the platform may log a truncated response warning or similar response-layer failure

## Why This Proves The Issue Is Real

The reasoning is straightforward.

### 1. The missing context fields are directly observed

The flow logs show that the action context does not contain:

- `rawRequest`
- any usable disconnect signal

That directly confirms the forwarding gap in `onCallGenkit`.

### 2. The flow keeps running after the client aborts

The client aborts after roughly 5 seconds, but the server logs continue through later silent-work steps.

That means the flow itself is not aware that the client has disconnected.

### 3. The disconnect is only noticed too late

A later platform warning such as `Truncated response body` shows that the outer HTTP layer eventually notices the broken stream, but only after the flow has already continued doing work.

This is exactly the harmful behavior described in the issue: AI or tool work can continue after the user has already stopped the request.

## Observed Repro Outcome

In the validated run, all of the following happened:

- the flow started with `hasRawRequest: false` and `hasSignal: false`
- the flow logged `rawRequest? undefined` and `response signal? undefined`
- the flow kept running through all 30 silent-work steps
- the flow finished normally
- only afterward did the platform log `Truncated response body`

That is conclusive evidence that the flow kept executing after client disconnect, with no disconnect signal available inside the Genkit flow context.

## Caveats

- This repro assumes the callable is invokable without Auth or App Check.
- This repro uses a raw HTTP client rather than the Firebase client SDK. That is acceptable here because the issue is in server-side `onCallGenkit` forwarding and disconnect handling.
- The exact downstream warning text can vary, but continued server progress after client abort is the core signal.

## Bottom Line

This repro establishes that issue `#1888` is a real runtime bug.

The missing context forwarding in `onCallGenkit` prevents Genkit flows from detecting client disconnects, and the flow can continue performing work after the client has already aborted.
