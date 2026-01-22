import { defineString } from "firebase-functions/params";
import { onMessagePublished } from "firebase-functions/v2/pubsub";

const topicName = defineString("some-topic");

// This should work but causes TypeScript error TS2769
// Type 'StringParam' is not assignable to type 'string'
export const myMessageConsumer = onMessagePublished(
  {
    topic: topicName,
  },
  async (message) => {
    console.log(message);
  }
);

// Working example with plain string (for comparison)
export const workingMessageConsumer = onMessagePublished(
  {
    topic: "some-topic",
  },
  async (message) => {
    console.log(message);
  }
);
