"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandlingTest3 = exports.errorHandlingTest2 = exports.errorHandlingTest1 = void 0;
const app_1 = require("firebase-admin/app");
const https_1 = require("firebase-functions/v2/https");
const functions = __importStar(require("firebase-functions/v2"));
// Initialize Firebase Admin
(0, app_1.initializeApp)();
/**
 * TEST 1: Direct error in handler (Baseline - Works Correctly)
 *
 * This function throws an error directly in the handler.
 * Both emulator and production should show full stack traces.
 *
 * Expected: Full stack trace in both emulator and production
 * Actual: Full stack trace in both (works correctly)
 */
exports.errorHandlingTest1 = (0, https_1.onRequest)(async (request, response) => {
    try {
        let nre = null;
        nre.explode = "bang"; // This will throw: Cannot set properties of null
    }
    catch (e) {
        functions.logger.error("Error invoking function", e, {
            query: request.query,
            body: request.body,
        });
        response.sendStatus(500);
    }
});
/**
 * TEST 2: Error in synchronous function (Baseline - Works Correctly)
 *
 * This function calls a synchronous function that throws an error.
 * Both emulator and production should show full stack traces.
 *
 * Expected: Full stack trace in both emulator and production
 * Actual: Full stack trace in both (works correctly)
 */
function explodeSync() {
    let nre = null;
    nre.explode = "bang"; // This will throw: Cannot set properties of null
}
exports.errorHandlingTest2 = (0, https_1.onRequest)(async (request, response) => {
    try {
        explodeSync();
    }
    catch (e) {
        functions.logger.error("Error invoking function", e, {
            query: request.query,
            body: request.body,
        });
        response.sendStatus(500);
    }
});
/**
 * TEST 3: Error in async function (BUG - Truncated Stack Trace)
 *
 * This function calls an async function that throws an error.
 * The emulator shows full stack traces, but production Error Reporting UI
 * only shows the last stack frame (truncated).
 *
 * Expected: Full stack trace in both emulator and production
 * Actual:
 *   - Emulator: Full stack trace ✓
 *   - Production Error Reporting UI: Truncated (only last frame) ✗
 *   - Production Cloud Logging: Full stack trace ✓ (workaround)
 */
async function explodeAsync() {
    await new Promise((r) => setTimeout(r, 1));
    let nre = null;
    nre.explode = "bang"; // This will throw: Cannot set properties of null
}
exports.errorHandlingTest3 = (0, https_1.onRequest)(async (request, response) => {
    try {
        await explodeAsync();
    }
    catch (e) {
        functions.logger.error("Error invoking function", e, {
            query: request.query,
            body: request.body,
        });
        response.sendStatus(500);
    }
});
//# sourceMappingURL=index.js.map