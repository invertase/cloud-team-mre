from firebase_functions import pubsub_fn


@pubsub_fn.on_message_published(topic="issue-333")
def handler(event: pubsub_fn.CloudEvent[pubsub_fn.MessagePublishedData]) -> None:
    message = event.data.message
    print("handler ran:", message.message_id, message.publish_time, flush=True)
