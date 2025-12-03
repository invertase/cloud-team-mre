# Updates Based on Issue Context

## Added from Issue Context

Based on the actual code from issue #8775, we've added:

### 1. **dotenv Package**
- Added `dotenv` dependency to `package.json`
- Added `require('dotenv').config();` to load `.env` file
- This is useful for local emulator testing, though Firebase CLI should handle `.env` during deployment

### 2. **Firebase Admin Initialization**
- Added Firebase Admin initialization pattern
- Matches the structure from the issue code

### 3. **Code Structure**
- Matches the pattern from the issue:
  - Uses `defineSecret()` to define secrets
  - Uses `onCall()` for 2nd gen callable functions
  - Includes proper comments explaining the issue

### 4. **Documentation Updates**
- Updated README to reflect the actual code pattern
- Added notes about `.env` file location (`functions/` directory)
- Clarified that the bug is about CLI not reading `.env` during deployment

## Key Insight

The issue shows that:
1. Code can use `dotenv` to read `.env` at runtime (for emulators)
2. But Firebase CLI should also read `.env` during deployment to **create secrets in Secret Manager**
3. The bug is that CLI doesn't do this automatically - it either:
   - Prompts you to enter the secret manually (what you experienced)
   - Fails with a misleading IAM error (the reported bug)

## Next Steps to Reproduce

1. Delete existing secret: `gcloud secrets delete MY_SECRET --project=extensions-2560`
2. Ensure `.env` is in `functions/` directory
3. Run `npm install` to get `dotenv` package
4. Try deploying: `npm run deploy`
5. Should either:
   - Read from `.env` automatically (if bug is fixed)
   - Prompt for input (part of the bug)
   - Fail with IAM error (the reported bug)

