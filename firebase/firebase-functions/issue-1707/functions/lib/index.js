"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMessage = void 0;
const app_1 = require("firebase-admin/app");
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
(0, app_1.initializeApp)();
/**
 * MRE for https://github.com/firebase/firebase-functions/issues/1707
 * Trigger this function and check logs: expected full object in jsonPayload,
 * actual: only the string "Hello from Firebase v2!" is logged.
 */
exports.logMessage = (0, https_1.onRequest)((_request, response) => {
    firebase_functions_1.logger.info({ message: "Hello from Firebase v2!", test: "hello" });
    firebase_functions_1.logger.info("Hey there!");
    firebase_functions_1.logger.info({ year: "2026", test: "hello", reason: "mre" });
    response.json({ ok: true, note: "Check function logs for logger output" });
});
//# sourceMappingURL=index.js.map