"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withGuard = void 0;
const v2_1 = require("firebase-functions/v2"); // This triggers the issue
exports.withGuard = v2_1.https.onCall(async (request) => {
    return { message: "ok" };
});
//# sourceMappingURL=index.js.map