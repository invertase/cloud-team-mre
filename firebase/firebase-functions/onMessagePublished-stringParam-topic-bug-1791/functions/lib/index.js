"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workingMessageConsumer = exports.myMessageConsumer = void 0;
const params_1 = require("firebase-functions/params");
const pubsub_1 = require("firebase-functions/v2/pubsub");
const topicName = (0, params_1.defineString)("some-topic");
// This should work but causes TypeScript error TS2769
// Type 'StringParam' is not assignable to type 'string'
exports.myMessageConsumer = (0, pubsub_1.onMessagePublished)({
    topic: topicName,
}, async (message) => {
    console.log(message);
});
// Working example with plain string (for comparison)
exports.workingMessageConsumer = (0, pubsub_1.onMessagePublished)({
    topic: "some-topic",
}, async (message) => {
    console.log(message);
});
//# sourceMappingURL=index.js.map