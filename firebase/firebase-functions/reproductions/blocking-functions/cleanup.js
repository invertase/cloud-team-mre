const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

async function cleanupBlockingFunctions() {
  console.log("Cleaning up blocking function configuration");
  console.log("===========================================");
  console.log("");

  try {
    // Delete the deployed functions
    console.log("Deleting deployed functions...");

    const deleteCommand =
      "firebase functions:delete beforeCreate beforeSignIn --force";
    console.log(`Running: ${deleteCommand}`);

    const { stdout, stderr } = await execAsync(deleteCommand);

    if (stdout) {
      console.log("Output:", stdout);
    }

    if (stderr) {
      console.log("Errors:", stderr);
    }

    console.log("✓ Functions deleted successfully");
    console.log("");
    console.log("Cleanup completed. The blocking function configuration");
    console.log("and deployed functions have been removed.");
  } catch (error) {
    console.error("Error during cleanup:", error.message);
    console.log("");
    console.log("You may need to manually delete the functions:");
    console.log("firebase functions:delete beforeCreate beforeSignIn --force");
  }
}

// Run the cleanup
cleanupBlockingFunctions();
