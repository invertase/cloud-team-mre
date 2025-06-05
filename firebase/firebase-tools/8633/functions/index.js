import { RESET_VALUE } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";

// Function with VPC configuration that demonstrates the issue
export const testVpcFunction = onRequest(
  {
    region: "europe-west1",
    memory: "256MiB",
    minInstances: 0,
    timeoutSeconds: 60,
    vpcConnectorEgressSettings: "PRIVATE_RANGES_ONLY",
    vpcConnector: RESET_VALUE,
  },
  async (request, response) => {
    try {
      response.json({
        message: "Hello from VPC-connected function",
        timestamp: new Date().toISOString(),
        vpcConfigured: true,
      });
    } catch (error) {
      response.status(500).json({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
);
