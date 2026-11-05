# firebase-functions-python issue #333 MRE

Minimal reproducible example for:
https://github.com/firebase/firebase-functions-python/issues/333

When a request reaches an `on_message_published` function without CloudEvent
(`ce-*`) headers, `functions-framework` converts the raw Pub/Sub push body into
a CloudEvent itself. That event only has `publishTime`, so the SDK raises
`KeyError: 'publish_time'` before the handler runs.

## Versions

- Python: `3.13`
- firebase-functions: `0.6.0`
- functions-framework: `3.10.2`

## Repro

1. From this directory, create and activate a venv:

   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # macOS/Linux
   # source venv/bin/activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start the function locally:

   ```bash
   functions-framework --target handler --signature-type cloudevent --port 8080
   ```

4. In another terminal, send the same Pub/Sub body twice, once with `ce-*`
   headers and once without:

   ```bash
   ./send.sh 8080
   ```

## Expected

Both requests reach the handler:

```text
CloudEvent with ce-* headers:
200
Same body, no ce-* headers:
200
```

## Actual

```text
CloudEvent with ce-* headers:
200
Same body, no ce-* headers:
500
```

Server log for the second request:

```text
  File ".../firebase_functions/pubsub_fn.py", line 189, in on_message_published_wrapped
  File ".../firebase_functions/pubsub_fn.py", line 111, in _message_handler
KeyError: 'publish_time'
```

## Notes

This runs locally with `functions-framework`, with no deploy or emulator. It
only shows what happens when the headers are missing. It does not reproduce
Eventarc delivering a request without them, which the issue reports as rare.
