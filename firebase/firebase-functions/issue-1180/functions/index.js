const admin = require("firebase-admin");
const functions = require("firebase-functions/v1");

admin.initializeApp();

// Repro target from issue #1180:
// https://github.com/firebase/firebase-functions/issues/1180
exports.func = functions.firestore
  .document("stuffs/{stuffid}")
  .onWrite(() => {
    return Promise.reject(new Error("I'm just returning a rejected promise"));
  });

// Helper function to trigger an onWrite event without extra setup.
exports.createStuff = functions.https.onRequest(async (_req, res) => {
  const docRef = admin.firestore().collection("stuffs").doc();

  await docRef.set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    source: "issue-1180-mre",
  });

  res.status(200).json({
    ok: true,
    id: docRef.id,
    path: docRef.path,
  });
});
