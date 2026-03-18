# firebase-functions-python issue #257 MRE

Minimal reproducible example for:
https://github.com/firebase/firebase-functions-python/issues/257

This MRE demonstrates that RTDB timestamps without microseconds can crash
`firebase_functions.db_fn._db_endpoint_handler` when parsed using:
`%Y-%m-%dT%H:%M:%S.%f%z`.

## Original issue versions (Oct 31, 2025)

- Python: `3.11`
- firebase-functions: `0.4.3`
- Runtime: `python311`
- Trigger type: RTDB `on_value_written`

## Prerequisites

- Python 3.11
- Firebase CLI (`npm install -g firebase-tools`)

## Setup

1. From this directory, create and activate a virtualenv:

   ```bash
   cd functions
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

## Repro A: deterministic local script

This path reproduces the exact parser crash without deploy/emulators by calling
the same internal handler used by RTDB triggers.

1. Run:

   ```bash
   python repro_strptime_bug.py
   ```

2. Observe:

   ```txt
   ValueError: time data '2025-10-30T21:15:51Z' does not match format '%Y-%m-%dT%H:%M:%S.%f%z'
   ```

## Repro B: RTDB trigger path

1. In another terminal at `issue-257/`, start emulators:

   ```bash
   firebase emulators:start --only functions,database
   ```

2. Trigger a write to `/items/123` in Realtime Database.

3. Intermittently, when the event timestamp arrives without microseconds
   (for example `2025-10-30T21:15:51Z`), the function fails before entering
   the user handler with the same `ValueError`.

## Files

- `functions/main.py`: RTDB trigger (`on_value_written`) used for real-path repro
- `functions/repro_strptime_bug.py`: deterministic local crash repro
- `functions/requirements.txt`: pinned to issue versions

## Notes

- This MRE reproduces behavior only; it does not apply a workaround.
