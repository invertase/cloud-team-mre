# firebase-tools issue #10661 MRE

This is a minimal repro for [firebase/firebase-tools#10661](https://github.com/firebase/firebase-tools/issues/10661).

## What this MRE isolates

- one Firebase project
- one minimal Gen 2 function
- one minimal Hosting site
- two concurrent combined deploys against the same project

The reported bug is that one deploy can log a Cloud Functions `409 unable to queue the operation`, still exit `0`, and leave Hosting unreleased.

## Files that matter

- `firebase.json`: minimal combined Hosting + Functions config
- `.firebaserc.example`: placeholder project config
- `functions/index.js`: one Gen 2 HTTP function named `ping`
- `functions/package-lock.json`: lockfile used by `npm ci` and Cloud Build
- `hosting/index.html`: one visible Hosting marker page

## Prerequisites

- Node.js 20
- a Firebase project with Hosting and Cloud Functions enabled
- authenticated Firebase CLI access

Use Node 20 for local setup too. The fixture pins `functions` to Node 20, and Cloud Build will install against that runtime.

## Setup

1. Create a local `.firebaserc`:
   ```bash
   cp .firebaserc.example .firebaserc
   ```
2. Replace `your-project-id` in `.firebaserc` with a real test project ID.
3. Install the Functions dependency from the committed lockfile:
   ```bash
   npm ci --prefix functions
   ```
4. If `npm ci` fails, stop there and fix that first. This repro is only valid with a `functions/package-lock.json` that is in sync with `functions/package.json`.

## Baseline deploy

Deploy once before starting the race so the project already has the function and a known live Hosting version:

```bash
npx firebase-tools@15.15.0 deploy --force --only hosting,functions --project your-project-id --debug
```

After the baseline deploy:

```text
issue-10661 baseline
```

That baseline marker now exists in both `hosting/index.html` and `functions/index.js`.

## Repro steps

Run the two combined deploys from two separate copies of this MRE so they can overlap cleanly:

1. Make two copies. Run the following:
   ```bash
   rm -rf /tmp/issue-10661-a /tmp/issue-10661-b
   cp -R . /tmp/issue-10661-a
   cp -R . /tmp/issue-10661-b
   ```
2. In copy A, change both Hosting and the `ping` function away from the baseline marker:
   ```bash
   perl -0pi -e 's/issue-10661 baseline/issue-10661 parallel-a/g' \
     /tmp/issue-10661-a/hosting/index.html \
     /tmp/issue-10661-a/functions/index.js
   ```
3. In copy B, do the same so terminal B is also deploying a changed `ping` function:
   ```bash
   perl -0pi -e 's/issue-10661 baseline/issue-10661 parallel-b/g' \
     /tmp/issue-10661-b/hosting/index.html \
     /tmp/issue-10661-b/functions/index.js
   ```
4. Reinstall dependencies from the lockfile in both copies:
   ```bash
   cd /tmp/issue-10661-a/functions
   npm ci
   cd /tmp/issue-10661-b/functions
   npm ci
   ```
5. In terminal A, start the first combined deploy:
   ```bash
   cd /tmp/issue-10661-a
   npx firebase-tools@15.15.0 deploy --force --only hosting,functions --project your-project-id --debug
   echo $?
   ```
6. Within a few seconds, in terminal B, start the second combined deploy:
   ```bash
   cd /tmp/issue-10661-b
   npx firebase-tools@15.15.0 deploy --force --only hosting,functions --project your-project-id --debug
   echo $?
   ```

Do not use this repro shape if either terminal logs:

```text
functions: Skipping the deploy of unchanged functions.
```

That means the function edit did not apply, so you are no longer racing two combined deploys against the same Gen 2 function.

If the race does not trigger on the first try, run the two deploys again. The collision window is when both deploys try to update the same Gen 2 function `ping` at nearly the same time.

## What to observe

On a reproducing run, one deploy can log output like:

```text
HTTP Error: 409, unable to queue the operation
failed to update function
```

Buggy behavior:

- the deploy process exits `0` (The `echo $?` in the command above will capture this)
- the live Hosting release does not move to the new version
- the live site can keep serving `issue-10661 baseline` instead of either updated marker

To confirm the Hosting side, find the site ID and inspect channel state:

```bash
npx firebase-tools@15.15.0 hosting:sites:list --project your-project-id
npx firebase-tools@15.15.0 hosting:channel:list --project your-project-id --site your-site-id
```

Expected correct behavior:

- any deploy that logs `failed to update function` should exit non-zero
- Hosting should not be reported as successfully deployed when the combined deploy fails
