const { onTaskDispatched } = require("firebase-functions/v2/tasks");

exports.myTaskFunction = onTaskDispatched({
  region: "us-central1",
}, (req) => {
  console.log("Executed myTaskFunction");
});
