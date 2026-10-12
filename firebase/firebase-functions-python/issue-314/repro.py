from firebase_functions import https_fn

err = https_fn.HttpsError(https_fn.FunctionsErrorCode.INVALID_ARGUMENT, "bad input")
print(repr(str(err)), err.args)
raise err
