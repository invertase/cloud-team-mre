"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloworld = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
exports.helloworld = (0, https_1.onCall)({ cors: params_1.projectID.equals('something').thenElse(['http://localhost:5173'], []) }, () => {
    return 'Hello from Firebase!';
});
//# sourceMappingURL=index.js.map