from firebase_functions.core import init
from firebase_admin import initialize_app
from firebase_functions import https_fn
from firebase_functions.firestore_fn import (
    on_document_created,
    Event,
    Change,
    DocumentSnapshot
)
from datetime import datetime

print("-----------------Main module loaded-----------------------------", flush=True)

@init
def initialize() -> None:
    print("---------------------Initializing----------------------------------", flush=True)

app = initialize_app()

@https_fn.on_request()
def hello_world_v2(req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response(
        {
            "message": "Hello from Firebase Functions!",
            "timestamp": datetime.now().isoformat()
        },
        content_type="application/json"
    )