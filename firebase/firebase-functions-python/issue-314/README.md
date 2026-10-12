# firebase-functions-python issue #314 MRE

Minimal reproducible example for:
https://github.com/firebase/firebase-functions-python/issues/314

`HttpsError.__init__` stores `self.message` but calls `super().__init__()`
with no arguments, so the message is missing from `str(err)`, `err.args`,
logs and tracebacks.

## Versions

- Python: `3.14`
- firebase-functions: `0.6.0`
- firebase-admin: `7.7.0`

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

3. Run the repro script:

   ```bash
   python repro.py
   ```

## Expected

```text
'bad input' ('bad input',)
Traceback (most recent call last):
  ...
firebase_functions.https_fn.HttpsError: bad input
```

## Actual

```text
'' ()
Traceback (most recent call last):
  File "repro.py", line 5, in <module>
    raise err
firebase_functions.https_fn.HttpsError
```

## Notes

This is a direct repro in `repro.py` with no deployed function or emulator
required.
