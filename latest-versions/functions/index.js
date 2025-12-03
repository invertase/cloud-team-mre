const admin = require("firebase-admin");
const {onCall} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
require("dotenv").config();

if (!admin.apps.length) {
  admin.initializeApp();
}

const mySecret = defineSecret("MY_SECRET_LATEST");

exports.issue8775 = onCall({secrets: [mySecret]}, async (request) => {
  return {
    message: "Function with secret executed successfully",
  };
});
