import { onCustomEventPublished } from "firebase-functions/v2/eventarc";
import { logger } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();

export const onimageResizedTestOnSuccessTrigger = onCustomEventPublished(
  "firebase.extensions.storage-resize-images.v1.complete",
  (event: any) => {
    logger.info("Received image resize completed event", event);
    // For example, write resized image details into Firestore.
    return getFirestore()
      .collection("testOnSuccessTriggerImages")
      .doc(event.subject.replace("/", "_")) // original file path
      .set(event.data); // resized images paths and sizes
  }
);

export const handleResizedImageSuccessReproduction = onCustomEventPublished(
  {
    eventType: "firebase.extensions.storage-resize-images.v1.onSuccess",
    region: "us-central1",
  },
  async (event) => {
    logger.info("Function triggered:", event);
  }
);
