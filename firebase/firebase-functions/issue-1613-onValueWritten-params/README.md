# MRE for #1613 – Realtime instance can not be configured using params for onValueWritten

Minimal Reproducible Example for [firebase/firebase-functions#1613](https://github.com/firebase/firebase-functions/issues/1613).

## Prerequisites

- Node v20.10.0 (or Node 20). Optional: use `nvm use` if you have [.nvmrc](.nvmrc).
- npm

## Setup

1. Install dependencies:
   ```bash
   cd functions && npm install
   ```

## Steps to reproduce

1. From the `functions/` directory, run:
   ```bash
   npm run build
   ```

## Expected behavior

Build succeeds, and the function could be deployed with the Realtime Database instance configured via the `REALTIME_INSTANCE` param (e.g. different instances per environment: production vs staging).

## Actual behavior

TypeScript compile error: `ReferenceOptions.instance` accepts only `string`, not the return value of `defineString(...)` (StringParam / Expression<string>). For example:

- Type 'StringParam' is not assignable to type 'string'.
- Argument of type '{ ref: string; instance: StringParam; }' is not assignable to parameter of type 'ReferenceOptions<string>'.

As a result, it is impossible to build the codebase and deploy functions with Realtime instance as a parameter.

## Environment (from issue)

| Item               | Value            |
| ------------------ | ---------------- |
| node               | v20.10.0         |
| firebase-functions | ^5.1.1           |
| firebase-tools     | 13.16.0          |
| firebase-admin     | ^12.4.0          |

## Link

https://github.com/firebase/firebase-functions/issues/1613
