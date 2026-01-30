"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.foo = void 0;
const database_1 = require("firebase-functions/v2/database");
const params_1 = require("firebase-functions/params");
exports.foo = (0, database_1.onValueWritten)({
    ref: "/foo/bar",
    instance: (0, params_1.defineString)("REALTIME_INSTANCE"),
}, async (change) => {
    console.log("hey!");
});
//# sourceMappingURL=index.js.map