# firebase-tools issue #6446 shell-arg MRE

This is a minimal repro of `firebase/firebase-tools#6446`.

It does not deploy anything.
It does not need Firebase auth.
It does not need Next.js.

It only demonstrates the shell argument bug behind the original failure:

```text
/.../runtime/shell -c -- <command>
/bin/sh: --: invalid option
```

## Root cause

In the standalone CLI path, the Firepit shell shim received arguments in this shape:

```text
["-c", "--", "<command>"]
```

The buggy normalization used by the old runtime removed `-c` but left the npm
sentinel `--` in place:

```text
["--", "<command>"]
```

That makes the shell try to execute `--` as the command, which reproduces the
exact error from issue `#6446`.

The patched normalization removes both `-c` and the following `--`:

```text
["<command>"]
```

## Source evidence

Before:

- `firebase-tools` `v12.7.0`
- commit `b1f3ddcd68128eaeb783fd414e20168b64e5d3ad`
- `standalone/runtime.js` only strips `-c`

After:

- your local patched `standalone/runtime.js`
- it strips both `-c` and the following `--`

The current latest GitHub release at the time of this check is:

- `v15.20.0`
- commit `08769b97a61101da6b455794e1a4192bcd146a94`

Important:

- the checked-in `v15.20.0` `standalone/runtime.js` on GitHub still shows the
  old `-c` stripping logic, not the patched `-c` plus `--` stripping logic

## Fix shape

The fix is small and specific:

```diff
- const args = process.argv.slice(2);
+ const args = normalizeShellScriptArgs(process.argv.slice(2));

- if ((index = args.indexOf("-c")) !== -1) {
-   args.splice(index, 1);
- }
+ if ((index = args.indexOf("-c")) !== -1) {
+   args.splice(index, 1);
+   if (args[index] === "--") {
+     args.splice(index, 1);
+   }
+ }
```

That is the entire behavioral change this MRE is demonstrating.

## Run

```bash
cd /Users/izaak/cloud-team-mre/firebase/firebase-tools/issue-6446-shell-arg
node compare.js
```

## Expected output

The `before-fix` case should print the same shell error shape as the GitHub
issue:

```text
/bin/sh: --: invalid option
```

The `after-fix` case should succeed.
