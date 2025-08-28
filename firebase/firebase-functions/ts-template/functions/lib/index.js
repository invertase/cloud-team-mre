"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResizedImageSuccessReproduction = exports.onimageResizedTestOnSuccessTrigger = void 0;
const eventarc_1 = require("firebase-functions/v2/eventarc");
const firebase_functions_1 = require("firebase-functions");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
(0, app_1.initializeApp)();
exports.onimageResizedTestOnSuccessTrigger = (0, eventarc_1.onCustomEventPublished)("firebase.extensions.storage-resize-images.v1.complete", (event) => {
    firebase_functions_1.logger.info("Received image resize completed event", event);
    // For example, write resized image details into Firestore.
    return (0, firestore_1.getFirestore)()
        .collection("testOnSuccessTriggerImages")
        .doc(event.subject.replace("/", "_")) // original file path
        .set(event.data); // resized images paths and sizes
});
exports.handleResizedImageSuccessReproduction = (0, eventarc_1.onCustomEventPublished)({
    eventType: "firebase.extensions.storage-resize-images.v1.onSuccess",
    region: "us-central1",
}, async (event) => {
    firebase_functions_1.logger.info("Function triggered:", event);
});
//# sourceMappingURL=index.js.map