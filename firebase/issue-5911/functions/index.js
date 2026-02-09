const functions = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");

initializeApp();

exports.bigben = functions.https.onRequest((req, res) => {
  res.json({
    message: "Big Ben",
    time: new Date().toISOString(),
  });
});
