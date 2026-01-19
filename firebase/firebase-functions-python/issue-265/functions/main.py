from firebase_functions import params
from firebase_functions.alerts import crashlytics_fn

def post_issue_to_gitlab(crash_type, event) -> None:
    # Instead of posting the issue, print a fun message related to the crash type and event
    print(f"Alert: {crash_type} detected. Event details: {event}")

@crashlytics_fn.on_new_fatal_issue_published(region="europe-west1", max_instances=1)
def post_fatal_issue_to_gitlab(event: crashlytics_fn.CrashlyticsNewFatalIssueEvent) -> None:
    # Call with a silly crash type for demonstration purposes
    post_issue_to_gitlab("Crashlytics - Unexpected Unicorn", event)