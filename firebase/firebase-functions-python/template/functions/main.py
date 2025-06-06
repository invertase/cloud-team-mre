from firebase_functions import https_fn
from firebase_admin import initialize_app
from firebase_functions.firestore_fn import (
    on_document_created,
    Event,
    Change,
    DocumentSnapshot
)
from datetime import datetime

initialize_app()

# Sample v2 HTTP function
@https_fn.on_request()
def hello_world_v2(req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response(
        {
            "message": "Hello from Firebase Functions!",
            "timestamp": datetime.now().isoformat()
        },
        content_type="application/json"
    )

# Sample v2 Firestore trigger
@on_document_created(document="collection/{documentId}")
def on_document_created_v2(event: Event[Change[DocumentSnapshot]]) -> None:
    new_value = event.data.after.to_dict()
    print(f"New document created: {event.data.after.id}, {new_value}")
    return None