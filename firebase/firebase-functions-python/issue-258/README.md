# firebase-functions-python issue #258 MRE

Minimal reproducible example for:
https://github.com/firebase/firebase-functions-python/issues/258

This MRE mirrors the two failing upstream scheduler tests:
- `test_on_schedule_decorator`
- `test_on_schedule_call`

The failure is triggered when `tzdata` is not installed and code tries to build:
`scheduler_fn.Timezone("America/Los_Angeles")`

## Prerequisites

- Python 3.11+
- `pip`

## Repro

1. Open this directory:

   ```bash
   cd firebase/firebase-functions-python/issue-258
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv .venv
   # Windows (PowerShell):
   .\.venv\Scripts\Activate.ps1
   # macOS/Linux:
   source .venv/bin/activate
   ```

3. Install dependencies (intentionally no `tzdata` in `requirements.txt`):

   ```bash
   python -m pip install -r requirements.txt
   ```

4. Run tests:

   ```bash
   python -m pytest -q
   ```

## Expected Behavior

Scheduler tests pass without requiring an undeclared extra dependency.

## Actual Behavior

Both tests fail with:

```text
zoneinfo._common.ZoneInfoNotFoundError: 'No time zone found with key America/Los_Angeles'
```

## Confirming The Fix

Install `tzdata`, then re-run tests:

```bash
python -m pip install tzdata
python -m pytest -q
```

The tests pass after `tzdata` is present.

## Note For Linux/macOS

Some environments include system timezone data, which can mask this issue.
If needed, set `PYTHONTZPATH` to an empty directory before running pytest to
simulate a missing timezone database.
