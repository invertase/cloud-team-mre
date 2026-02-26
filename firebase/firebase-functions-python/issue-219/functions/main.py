from firebase_functions import https_fn, params
from firebase_admin import initialize_app


initialize_app()


VPC_CONNECTOR = params.StringParam("VPC_CONNECTOR")


@https_fn.on_request(
    region="us-central1",
    vpc_connector=VPC_CONNECTOR,
)
def hello_vpc(request: https_fn.Request) -> https_fn.Response:
    return https_fn.Response("ok")

