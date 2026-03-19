import unittest
from datetime import datetime
from unittest.mock import Mock

from flask import Flask, Request
from werkzeug.test import EnvironBuilder

from firebase_functions import scheduler_fn


class TestScheduler(unittest.TestCase):
    def test_on_schedule_decorator(self):
        schedule = "* * * * *"
        tz = "America/Los_Angeles"
        example_func = Mock(__name__="example_func")

        decorated_func = scheduler_fn.on_schedule(
            schedule=schedule,
            timezone=scheduler_fn.Timezone(tz),
        )(example_func)

        endpoint = decorated_func.__firebase_endpoint__
        self.assertIsNotNone(endpoint)
        self.assertIsNotNone(endpoint.scheduleTrigger)
        self.assertEqual(endpoint.scheduleTrigger.get("schedule"), schedule)
        self.assertEqual(endpoint.scheduleTrigger.get("timeZone"), tz)

    def test_on_schedule_call(self):
        with Flask(__name__).test_request_context("/"):
            environ = EnvironBuilder(
                headers={
                    "X-CloudScheduler-JobName": "example-job",
                    "X-CloudScheduler-ScheduleTime": "2023-04-13T12:00:00-07:00",
                }
            ).get_environ()

            mock_request = Request(environ)
            example_func = Mock(__name__="example_func")
            decorated_func = scheduler_fn.on_schedule(schedule="* * * * *")(example_func)
            response = decorated_func(mock_request)

            self.assertEqual(response.status_code, 200)
            example_func.assert_called_once_with(
                scheduler_fn.ScheduledEvent(
                    job_name="example-job",
                    schedule_time=datetime(
                        2023,
                        4,
                        13,
                        12,
                        0,
                        tzinfo=scheduler_fn.Timezone("America/Los_Angeles"),
                    ),
                )
            )
