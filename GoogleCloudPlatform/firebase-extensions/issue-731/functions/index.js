import admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";

const collection1 = "issue731-generate-google"
const promptField1 = "prompt"

const collection2 = "issue731-generate-vertex"
const promptField2 = "prompt"

const collection1Errors = "issue731-generate-google-errors"
const collection2Errors = "issue731-generate-vertex-errors"

admin.initializeApp();
const db = admin.firestore();


export const issue731CreateDocumentSchedule5 = onSchedule("every 5 minutes", async () => {
  // Clear all documents in each collection
  await db.collection(collection1).get().then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      doc.ref.delete();
    });
  });
  await db.collection(collection2).get().then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      doc.ref.delete();
    });
  });

  // Create 10 documents in each collection
  const batch = db.batch();
  for (let i = 0; i < 10; i++) {
    const docRef1 = db.collection(collection1).doc();
    const docRef2 = db.collection(collection2).doc();
    batch.set(docRef1, {
      [promptField1]: "How are you?",
      timestamp731: new Date().toISOString(),
    });
    batch.set(docRef2, {
      [promptField2]: "How are you?",
      timestamp731: new Date().toISOString(),
    });
  }
  await batch.commit();
});

export const issue731OnDocumentUpdate1 = onDocumentUpdated(
  collection1,
  async (event) => {
    const data = event.data.after.data();
    if (data.status?.state === "ERROR") {
      const errorDocRef = db.collection(collection1Errors).doc();
      await errorDocRef.set({
        ...data,
      });
    }
  }
);

export const issue731OnDocumentUpdate2 = onDocumentUpdated(
  collection2,
  async (event) => {
    const data = event.data.after.data();
    if (data.status?.state === "ERROR") {
      const errorDocRef = db.collection(collection2Errors).doc();
      await errorDocRef.set({
        ...data,
      });
    }
  }
);