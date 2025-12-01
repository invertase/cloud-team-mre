"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloFailingInitialDeploy = void 0;
const https_1 = require("firebase-functions/v2/https");
/**
 * FIXED VERSION - Inline the value instead of importing from *.local
 *
 * Copy this file over index.ts for the second deployment:
 *   cp functions/src/index.ts.fixed functions/src/index.ts
 *
 * This deployment will succeed, BUT the IAM policies won't be applied
 * because firebase-tools treats it as an "update" (not a "create").
 */
const value = "some value";
exports.helloFailingInitialDeploy = (0, https_1.onRequest)((request, response) => {
    response.send(`Hello from Firebase! The value is: ${value}`);
});
//# sourceMappingURL=index.js.map