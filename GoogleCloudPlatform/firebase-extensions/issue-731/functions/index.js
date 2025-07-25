import admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";

const collection1 = "issue731-generate-google"
const promptField1 = "prompt"

const collection2 = "issue731-generate-vertex"
const promptField2 = "prompt"

admin.initializeApp();
const db = admin.firestore();


export const issue731CreateDocumentSchedule5 = onSchedule("every 5 minutes", async () => {
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