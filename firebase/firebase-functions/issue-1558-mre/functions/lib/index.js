"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforesignedin = exports.beforecreated = void 0;
const app_1 = require("firebase-admin/app");
const identity_1 = require("firebase-functions/v2/identity");
exports.beforecreated = (0, identity_1.beforeUserCreated)((event) => {
    console.log("befoerUserCreated", event);
    return;
});
exports.beforesignedin = (0, identity_1.beforeUserSignedIn)((event) => {
    console.log("beforeUserSignedIn", event);
});
(0, app_1.initializeApp)();
//# sourceMappingURL=index.js.map