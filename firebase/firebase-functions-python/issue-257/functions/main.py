from firebase_admin import initialize_app
from firebase_functions.db_fn import Event, on_value_written
from firebase_functions.core import Change

initialize_app()


@on_value_written(reference="/items/{itemId}")
def issue_257_on_value_written(event: Event[Change[dict]]) -> None:
    # The callback body can be empty; the bug occurs before this is called
    # when db_fn.py parses event_attributes["time"].
    print("Event received for /items/{itemId}")
