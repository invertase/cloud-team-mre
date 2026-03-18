"""Direct MRE for firebase-functions-python issue #260.

This intentionally feeds a dict-based Firebase Timestamp for digestDate,
which crashes on firebase-functions==0.5.0 with:
AttributeError: 'dict' object has no attribute 'split'
"""

from cloudevents.http import CloudEvent
from firebase_functions.private._alerts_fn import crashlytics_event_from_ce


def build_event() -> CloudEvent:
    attributes = {
        "id": "11111111-1111-1111-1111-111111111111",
        "source": "//firebasealerts.googleapis.com/projects/demo-project/alerts/abc",
        "specversion": "1.0",
        "type": "google.firebase.firebasealerts.alerts.v1.published",
        "time": "2025-11-06T12:00:00.000Z",
        "subject": "projects/demo-project/alerts/abc",
        "alerttype": "crashlytics.stabilityDigest",
        "appid": "1:1234567890:android:abcdef",
    }

    data = {
        "createTime": "2025-11-06T12:00:00.000Z",
        "endTime": "2025-11-06T12:05:00.000Z",
        "payload": {
            "digestDate": {
                "seconds": 1730894400,
                "nanoseconds": 0,
            },
            "trendingIssues": [
                {
                    "type": "new",
                    "issue": {
                        "id": "issue-1",
                        "title": "App crash",
                        "subtitle": "Null pointer exception",
                        "appVersion": "1.0.0",
                    },
                    "eventCount": 10,
                    "userCount": 2,
                }
            ],
        },
    }

    return CloudEvent(attributes, data)


def main() -> None:
    event = build_event()
    crashlytics_event_from_ce(event)


if __name__ == "__main__":
    main()
