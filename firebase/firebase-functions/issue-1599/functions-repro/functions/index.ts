import { initializeApp } from "firebase-admin/app";
import { beforeUserCreated } from "firebase-functions/identity";
import { getFirestore } from "firebase-admin/firestore";
// import { onRequest } from "firebase-functions/https";
import { onDocumentCreated } from "firebase-functions/firestore";

// Initialize Firebase Admin
initializeApp();

export const beforeCreated = beforeUserCreated({
  region: 'us-west2',
}, async (event: any) => {
  const firestore = getFirestore();

  const newUser = {
      email: event.data.email,
      uid: event.data.uid,
  };

  const userDocRef = firestore.collection('Issue1599Users').doc();
  await userDocRef.create(newUser)
      .catch((error:any) => {
          return `Failed adding new user with email ${newUser.email}: '${error}'`;
      });

  return {
      customClaims: { fs_user_id: userDocRef.id },
  };
});

export const onDocumentCreated_v2 = onDocumentCreated(
  "collection/{documentId}",
  (event) => {
    const newValue = event.data?.data();
    console.log("New document created:", event.params.documentId, newValue);
    return null;
  }
);