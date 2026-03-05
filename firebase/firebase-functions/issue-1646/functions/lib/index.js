"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newapp = void 0;
/**
 * MRE for https://github.com/firebase/firebase-functions/issues/1646
 * Non-UTF-8 URL encoding (e.g. /%C3) causes internal server error instead of 400 or normal handling.
 */
const express_1 = __importDefault(require("express"));
const basicAuth = require("basic-auth-connect");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const functions = __importStar(require("firebase-functions"));
const path_1 = __importDefault(require("path"));
const server = (0, express_1.default)();
server.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
server.disable("x-powered-by");
server.all("/*", basicAuth((user, passwd) => user === "username" && passwd === "passwd "));
// Middleware to catch and validate URL encoding
server.use((req, res, next) => {
    try {
        decodeURIComponent(req.url);
        next();
    }
    catch (_a) {
        res.status(400).send({ error: "Invalid URL encoding" });
    }
});
server.use("*", express_1.default.static(path_1.default.join(__dirname, "..", "static")));
exports.newapp = functions.https.onRequest(server);
//# sourceMappingURL=index.js.map