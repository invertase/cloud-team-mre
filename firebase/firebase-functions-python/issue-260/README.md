# firebase-functions-python issue #260 MRE

Minimal reproducible example for:
https://github.com/firebase/firebase-functions-python/issues/260

This MRE reproduces the failure where Crashlytics `stabilityDigest` payloads
carry `digestDate` as a Firebase Timestamp object (`{"seconds", "nanoseconds"}`),
but `firebase-functions==0.5.0` treats it as a string and calls `.split()`.

## Versions

- Python: `3.11`
- firebase-functions: `0.5.0`
- firebase-admin: `7.1.0`

## Repro (direct, deterministic)

1. From this directory, create and activate a venv:

   ```bash
   cd functions
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

3. Run the repro script:

   ```bash
   python repro.py
   ```

## Expected

Crashlytics stability digest payload is parsed successfully.

## Actual

The script fails with:

```text
AttributeError: 'dict' object has no attribute 'split'
```

and the stack includes:

```text
firebase_functions/private/_alerts_fn.py ... stability_digest_payload_from_ce_payload
firebase_functions/private/util.py ... get_precision_timestamp
```

## Notes

This is intentionally a direct parser repro (`functions/repro.py`) with no
deployed function handler required.
