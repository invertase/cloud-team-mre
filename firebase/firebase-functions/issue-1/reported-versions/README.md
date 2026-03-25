# Issue 1 - Reported Versions

## Versions

- node: v20.10.0 (reported)
- firebase-functions: v7.0.1
- firebase-tools: v15.1.0 (reported)

## Steps

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run typecheck:

   ```bash
   npm run check
   ```

## Expected

The function declaration should accept a parameterized topic.

## Actual

TypeScript reports `TS2769` because `topic` expects `string` and does not accept `StringParam`.
