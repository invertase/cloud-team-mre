from firebase_functions import https_fn
import firebase_admin
from firebase_admin import firestore

app = firebase_admin.initialize_app()
db = firestore.client()

@https_fn.on_request()
def hello_world(req: https_fn.Request) -> https_fn.Response:
    db.collection("test").add({"msg": "hello"})
    return https_fn.Response("Added a document")