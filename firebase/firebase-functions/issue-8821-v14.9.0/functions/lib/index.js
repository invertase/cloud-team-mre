"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issue8821_v14_9_0 = void 0;
const app_1 = require("firebase-admin/app");
const https_1 = require("firebase-functions/v1/https");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
// Sample v1 HTTP function
exports.issue8821_v14_9_0 = (0, https_1.onRequest)((request, response) => {
    response.json({
        message: "Hello from Firebase Functions!",
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=index.js.map