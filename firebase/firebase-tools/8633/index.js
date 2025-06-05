import { onRequest } from "firebase-functions/v2/https";

// Function that demonstrates the Direct VPC egress issue
export const testVpcFunction = onRequest(
  {
    region: "europe-west1",
    memory: "256MiB",
    minInstances: 0,
    timeoutSeconds: 60,
    // This should enable Direct VPC egress but doesn't work with Firebase CLI
    vpcConnectorEgressSettings: "PRIVATE_RANGES_ONLY",
  },
  async (request, response) => {
    try {
      response.json({
        foo: "bar",
      });
    } catch (error) {
      response.status(500).json({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
);
