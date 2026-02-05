import { initializeApp } from "firebase-admin/app";
import type { UserRecord } from "firebase-admin/auth";
import * as functions from "firebase-functions";

initializeApp();

export const onAuthUserCreate = functions.auth.user().onCreate((user: UserRecord) => {
  const payload = {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    displayName: user.displayName,
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
    disabled: user.disabled,
    metadata: user.metadata,
    providerData: user.providerData?.map((p: { providerId: string; uid: string; displayName?: string | null; email?: string | null }) => ({
      providerId: p.providerId,
      uid: p.uid,
      displayName: p.displayName,
      email: p.email,
    })),
  };
  functions.logger.info("auth.user().onCreate - user record (issue #1592)", user.toJSON());
  functions.logger.info("auth.user().onCreate - payload (issue #1592)", payload);
  return null;
});
