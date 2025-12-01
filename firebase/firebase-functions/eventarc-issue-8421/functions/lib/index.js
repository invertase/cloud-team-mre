"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEventHandler = void 0;
const app_1 = require("firebase-admin/app");
const eventarc_1 = require("firebase-functions/v2/eventarc");
(0, app_1.initializeApp)();
const EVENT_TYPE = "com.example.test.v1";
/**
 * Event handler that listens for custom Eventarc events.
 *
 * After deploying with `firebase deploy --only functions`, this function
 * will NOT receive events due to misconfigured Cloud Run audience and
 * missing IAM permissions.
 *
 * See README.md for reproduction steps and verification commands.
 */
exports.testEventHandler = (0, eventarc_1.onCustomEventPublished)(EVENT_TYPE, (event) => {
    console.log("========================================");
    console.log("EVENT RECEIVED - If you see this, the bug is fixed!");
    console.log("========================================");
    console.log("Event ID:", event.id);
    console.log("Event Type:", event.type);
    console.log("Event Time:", event.time);
    console.log("Event Data:", JSON.stringify(event.data, null, 2));
    console.log("========================================");
});
//# sourceMappingURL=index.js.map