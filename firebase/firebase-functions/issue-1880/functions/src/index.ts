import { initializeApp } from "firebase-admin/app";
import { onCall } from "firebase-functions/v2/https";

initializeApp();

export const callableEcho = onCall((request): { readonly ok: true; readonly data: unknown } => {
  return {
    ok: true,
    data: request.data,
  };
});
