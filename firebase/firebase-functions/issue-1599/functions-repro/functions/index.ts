import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { beforeUserCreated } from "firebase-functions/v2/identity";
// import { onRequest } from "firebase-functions/https";

// Initialize Firebase Admin
initializeApp();

export const beforeCreated = beforeUserCreated({
  region: 'us-west2',
}, async (event: any) => {
  const firestore = getFirestore();
  const now = new Date();
  const timeWithMs = now.toTimeString().split(' ')[0] + '.' + now.getMilliseconds().toString().padStart(3, '0');

  const newUser = {
    email: event.data.email,
    uid: event.data.uid,
    timestamp: timeWithMs
  };

  const userDocRef = firestore.collection('Issue1599Users').doc();
  await userDocRef.create(newUser)
    .catch((error: any) => {
      return `Failed adding new user with email ${newUser.email}: '${error}'`;
    });

  return {
    customClaims: { fs_user_id: userDocRef.id },
  };
});
