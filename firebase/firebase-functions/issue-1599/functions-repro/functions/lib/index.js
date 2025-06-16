"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforeCreated = void 0;
const app_1 = require("firebase-admin/app");
const identity_1 = require("firebase-functions/identity");
const firestore_1 = require("firebase-admin/firestore");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
exports.beforeCreated = (0, identity_1.beforeUserCreated)({
    region: 'us-west2',
}, async (event) => {
    const firestore = (0, firestore_1.getFirestore)();
    const newUser = {
        email: event.data.email,
        uid: event.data.uid,
    };
    const userDocRef = firestore.collection('Issue1599Users').doc();
    await userDocRef.create(newUser)
        .catch((error) => {
        return `Failed adding new user with email ${newUser.email}: '${error}'`;
    });
    return {
        customClaims: { fs_user_id: userDocRef.id },
    };
});
//# sourceMappingURL=index.js.map