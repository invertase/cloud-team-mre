# Issue #1726 MRE: Post-install script fails in VS Code Dev Container

## Description

This MRE reproduces a bug where firebase-functions post-install scripts fail in VS Code Dev Containers, preventing subpath export files (e.g., `auth.d.ts`, `https.d.ts`) from being created. This leads to compile-time errors (`TS2307: Cannot find module 'firebase-functions/auth'`) and runtime errors (`ERR_PACKAGE_PATH_NOT_EXPORTED`).

## Environment

- **OS:** Standard VS Code Dev Container (Debian base)
- **Node.js:** v20.19.2
- **firebase-functions:** 5.0.1 and latest
- **firebase-admin:** latest
- **typescript:** latest
