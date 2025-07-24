"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mininstancesrepro = void 0;
const app_1 = require("firebase-admin/app");
const https_1 = require("firebase-functions/v2/https");
(0, app_1.initializeApp)();
exports.mininstancesrepro = (0, https_1.onRequest)({
    minInstances: 0,
    maxInstances: 10,
    region: "us-central1",
}, (request, response) => {
    response.json({
        message: "Hello from Firebase Functions!",
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=index.js.map