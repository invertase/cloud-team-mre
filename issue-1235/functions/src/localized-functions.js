const DEFAULT_FUNCTIONS_REGION = "europe-west3";

import "firebase-functions/lib/logger/compat";
import * as _functions from "firebase-functions";

export const functions = _functions.region(DEFAULT_FUNCTIONS_REGION);

