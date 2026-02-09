const { onRequest } = require("firebase-functions/v1/https");
const { initializeApp } = require("firebase-admin/app");

initializeApp();

exports.bigben = onRequest((req, res) => {
  res.json({
    message: "Big Ben",
    time: new Date().toISOString(),
  });
});
