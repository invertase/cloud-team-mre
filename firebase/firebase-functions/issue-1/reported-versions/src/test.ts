import { defineString } from "firebase-functions/params";
import { onMessagePublished } from "firebase-functions/v2/pubsub";

const topicName = defineString("some-topic");

export const myMessageConsumer = onMessagePublished(
  {
    topic: topicName
  },
  async (message) => {
    console.log(message);
  }
);
