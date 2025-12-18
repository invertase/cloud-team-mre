import { initializeApp } from "firebase-admin/app";
import { myTrigger } from "./file1.js";
import { myOtherTrigger } from "./file2.js";
import { RUNTIME_OPTS } from "./localized-functions.js";

initializeApp();

console.log("Final RUNTIME_OPTS:", JSON.stringify(RUNTIME_OPTS, null, 2));

export { myTrigger, myOtherTrigger };


