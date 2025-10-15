"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforeSignIn = exports.beforeCreate = void 0;
const identity_1 = require("firebase-functions/v2/identity");
exports.beforeCreate = (0, identity_1.beforeUserCreated)((event) => {
    console.log("beforeUserCreated triggered");
    return;
});
exports.beforeSignIn = (0, identity_1.beforeUserSignedIn)((event) => {
    console.log("beforeUserSignedIn triggered");
    return;
});
//# sourceMappingURL=index.js.map