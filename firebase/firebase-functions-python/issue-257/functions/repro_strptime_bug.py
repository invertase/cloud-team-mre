"""
Deterministic repro for firebase-functions-python issue #257.

This calls the same internal code path used by RTDB triggers and passes a valid
ISO 8601 timestamp without microseconds:
    2025-10-30T21:15:51Z
"""

from cloudevents.http import CloudEvent
from firebase_functions.db_fn import _db_endpoint_handler, _event_type_written
from firebase_functions.private.path_pattern import PathPattern


def _handler(event) -> None:
    print("Handler invoked:", event)


def main() -> None:
    attributes = {
        "specversion": "1.0",
        "id": "issue-257-repro",
        "source": "//firebase.test/projects/demo-test/instances/my-instance/refs/items/123",
        "type": _event_type_written,
        "subject": "refs/items/123",
        "time": "2025-10-30T21:15:51Z",
        "instance": "my-instance",
        "ref": "/items/123",
        "location": "us-central1",
        "firebasedatabasehost": "my-instance.firebaseio.com",
    }
    payload = {
        "data": {"existing": True},
        "delta": {"updated": True},
    }

    raw_event = CloudEvent(attributes, payload)
    _db_endpoint_handler(
        _handler,
        _event_type_written,
        PathPattern("/items/{itemId}"),
        PathPattern("{instanceId}"),
        raw_event,
    )


if __name__ == "__main__":
    main()
