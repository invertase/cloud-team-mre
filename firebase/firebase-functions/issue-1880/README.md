# firebase-functions issue 1880 repro

This reproduces the hard-coded error-level log for invalid v2 callable
requests described in https://github.com/firebase/firebase-functions/issues/1880.

## Issue

When a v2 `onCall` function receives an invalid request, such as `GET` instead
of `POST`, `firebase-functions` logs `Invalid request, unable to process.` at
`ERROR` severity before returning `400 Bad Request`.

For public callable URLs, crawlers, probes, or misconfigured health checks can
therefore create noisy Cloud Logging error entries and Error Reporting events,
even though user function code was never reached.

## Reproduce

```powershell
cd functions; npm install; npm run build
```

Deploy the callable function to a Firebase project:

```powershell
npm run deploy
```

Call the deployed v2 callable URL with `GET`:

```powershell
curl -i "https://<region>-<project-id>.cloudfunctions.net/callableEcho"
```

You can also run the emulator:

```powershell
npm run serve
curl -i "http://127.0.0.1:5001/<project-id>/us-central1/callableEcho"
```

## Expected

The invalid request should return `400 Bad Request`, but the function owner
should be able to configure the severity used for the framework validation log.

## Actual

With `firebase-functions@7.2.5`, the invalid request returns `400 Bad Request`
and logs this message at error severity:

```text
Invalid request, unable to process.
```

Because the log is produced by the Firebase Functions request validation layer,
the exported `callableEcho` handler in `src/index.ts` is intentionally simple
and does not log anything itself.
