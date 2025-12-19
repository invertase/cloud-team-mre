# Issue #1715 MRE: Warning about using .value() in CORS option

## Description

This MRE reproduces a warning that appears when using Firebase Functions params expressions (like `projectID.equals().thenElse()`) in CORS configuration. The warning incorrectly suggests that `.value()` is being called by the user, even though it's only used internally by firebase-functions.

## Environment

- **node:** 22.17.1
- **firebase-functions:** 6.4.0
- **firebase-tools:** 14.11.1
- **firebase-admin:** 13.4.0
- **Platform:** macOS (Darwin 25.0.0)

## Problem

When using params expressions in CORS configuration, Firebase Functions shows a misleading warning that suggests `.value()` is being invoked during deployment, even though the user code does not explicitly call `.value()`.

### Expected Behavior

Deploys cleanly without warnings.

### Actual Behavior

Gets a warning during deployment:

```
{"severity":"WARNING","message":"params.PROJECT_ID == \"something\" ? [\"http://localhost:5173\"] : [].value() invoked during function deployment, instead of during runtime."}
{"severity":"WARNING","message":"This is usually a mistake. In configs, use Params directly without calling .value()."}
{"severity":"WARNING","message":"example: { memory: memoryParam } not { memory: memoryParam.value() }"}
```

Despite not using `.value()` in the code. The `.value()` is inside firebase-functions' own code.

## Test Case

The `functions/index.ts` file contains the test function:

```typescript
import { onCall } from 'firebase-functions/v2/https';
import { projectID } from 'firebase-functions/params';

export const helloworld = onCall<unknown, string>(
  { cors: projectID.equals('something').thenElse(['http://localhost:5173'], []) },
  () => {
    return 'Hello from Firebase!';
  },
);
```

## Steps to Reproduce

1. **Install dependencies:**
   ```bash
   cd functions
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Login to Firebase (if not already logged in):**
   ```bash
   firebase login
   ```

4. **Initialize Firebase project (if not already done):**
   ```bash
   firebase init
   ```
   - Select "Functions" when prompted
   - Use an existing project or create a new one
   - Choose TypeScript
   - Use default settings

5. **Deploy the function:**
   ```bash
   npm run deploy
   ```
   Or from the root directory:
   ```bash
   firebase deploy --only functions
   ```

6. **Observe the warning:**
   - During deployment, you should see the warning messages in the output
   - The function will deploy successfully despite the warning
   - The warning message incorrectly suggests `.value()` is being called in user code

## Expected Warning Output

The deployment output should include:

```
{"severity":"WARNING","message":"params.PROJECT_ID == \"something\" ? [\"http://localhost:5173\"] : [].value() invoked during function deployment, instead of during runtime."}
{"severity":"WARNING","message":"This is usually a mistake. In configs, use Params directly without calling .value()."}
{"severity":"WARNING","message":"example: { memory: memoryParam } not { memory: memoryParam.value() }"}
```

## Verification

After deployment:

1. **Check that the function deployed successfully:**
   ```bash
   firebase functions:list
   ```
   Should show `helloworld` function.

2. **Verify the warning appeared:**
   - Check the deployment logs/output
   - The warning should appear even though `.value()` is not explicitly called in the code

3. **Test the function (optional):**
   ```bash
   # Get the function URL from Firebase Console or deployment output
   # Then test with curl or your client
   ```

## Notes

- This MRE focuses on reproducing the warning, not a functional bug
- The function should deploy successfully despite the warning
- The warning is misleading since `.value()` is not explicitly called in user code
- The `.value()` call is happening internally within firebase-functions when evaluating the params expression
- The warning message suggests using Params directly, but the code is already doing that correctly

## Related Issues

This issue demonstrates that the warning detection logic may be incorrectly flagging internal `.value()` calls that occur when evaluating params expressions like `equals().thenElse()`.

