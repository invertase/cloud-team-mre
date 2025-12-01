/**
 * This module is intentionally placed in a *.local directory.
 * The *.local pattern is in firebase.json's ignore list, so this file
 * will NOT be included in the deployed Cloud Run container.
 *
 * This causes the initial deployment to fail the health check because
 * the import in index.ts cannot be resolved at runtime.
 */
export const value = "some value";
