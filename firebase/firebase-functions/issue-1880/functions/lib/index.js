"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callableEcho = void 0;
const app_1 = require("firebase-admin/app");
const https_1 = require("firebase-functions/v2/https");
(0, app_1.initializeApp)();
exports.callableEcho = (0, https_1.onCall)((request) => {
    return {
        ok: true,
        data: request.data,
    };
});
//# sourceMappingURL=index.js.map