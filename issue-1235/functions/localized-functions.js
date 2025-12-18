const DEFAULT_FUNCTIONS_REGION = "europe-west3";

import "firebase-functions/lib/logger/compat";
import * as _functions from "firebase-functions";

// Shared RUNTIME_OPTS object - will be mutated when .region() is called
export const RUNTIME_OPTS = {
  maxInstances: 3,
};

export const functions = _functions
  .runWith(RUNTIME_OPTS)
  .region(DEFAULT_FUNCTIONS_REGION);


