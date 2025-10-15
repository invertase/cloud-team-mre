const https = require("https");
const fs = require("fs");
const admin = require("firebase-admin");

// Read Firebase project configuration
const firebaseConfig = JSON.parse(fs.readFileSync(".firebaserc", "utf8"));
const projectId = firebaseConfig.projects.default;

// Initialize Firebase Admin SDK with service account
let serviceAccount;
try {
  serviceAccount = require("./serviceAccount.json");
} catch (error) {
  console.error("Error: serviceAccount.json not found");
  console.error(
    "Please download your service account key from Firebase Console"
  );
  console.error("and save it as serviceAccount.json in this directory");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: projectId,
});

async function makeRequest(method, path, data = null) {
  // Get access token from service account
  const accessToken = await admin.credential
    .cert(serviceAccount)
    .getAccessToken();

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "identitytoolkit.googleapis.com",
      port: 443,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.access_token}`,
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testBlockingFunctionAPI() {
  console.log("Testing Identity Toolkit Blocking Function API");
  console.log("==============================================");
  console.log(`Project ID: ${projectId}`);
  console.log("");

  try {
    // Step 1: Set blocking function triggers
    console.log("Step 1: Setting blocking function triggers...");

    // Test with incorrect event type names to demonstrate the issue
    const blockingConfig = {
      blockingFunctions: {
        triggers: {
          beforeUserCreated: {
            functionUri: `https://us-central1-${projectId}.cloudfunctions.net/beforeCreate`,
          },
          beforeUserSignedIn: {
            functionUri: `https://us-central1-${projectId}.cloudfunctions.net/beforeSignIn`,
          },
        },
      },
    };

    console.log("Configuration to set:");
    console.log(JSON.stringify(blockingConfig, null, 2));
    console.log("");

    const setResponse = await makeRequest(
      "PATCH",
      `/v2/projects/${projectId}/config`,
      blockingConfig
    );

    console.log("API Response (Setting triggers):");
    console.log(`Status: ${setResponse.status}`);
    console.log(JSON.stringify(setResponse.data, null, 2));
    console.log("");

    // Step 2: Verify the configuration was actually set
    console.log("Step 2: Verifying configuration was set...");

    const getResponse = await makeRequest(
      "GET",
      `/v2/projects/${projectId}/config`
    );

    console.log("API Response (Getting config):");
    console.log(`Status: ${getResponse.status}`);
    console.log(JSON.stringify(getResponse.data, null, 2));
    console.log("");

    // Step 3: Analysis
    console.log("Analysis:");
    console.log("=========");

    if (setResponse.status === 200) {
      console.log("✓ Setting triggers returned 200 OK");
    } else if (setResponse.status === 403) {
      console.log("✗ Setting triggers returned 403 PERMISSION_DENIED");
      console.log(
        "  This demonstrates authentication issues with the Identity Toolkit API"
      );
      console.log(
        "  The API is difficult to use and has complex authentication requirements"
      );
    } else {
      console.log(`✗ Setting triggers returned ${setResponse.status}`);
    }

    if (getResponse.data && getResponse.data.blockingFunctions) {
      const triggers = getResponse.data.blockingFunctions.triggers || {};
      if (triggers.beforeUserCreated || triggers.beforeUserSignedIn) {
        console.log("✓ Triggers are actually configured");
        console.log("  Found triggers:", Object.keys(triggers));
      } else {
        console.log("✗ Triggers are NOT configured");
        console.log(
          "  Current blocking functions config:",
          JSON.stringify(getResponse.data.blockingFunctions, null, 2)
        );
        console.log("  This demonstrates the API issue");
      }
    } else {
      console.log("✗ No blocking functions configuration found");
      console.log("  This demonstrates the API issue");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the test
testBlockingFunctionAPI();
