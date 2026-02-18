const functions = require("firebase-functions");

const EXPECTED_KEYS = ["PLANET", "AUDIENCE", "MY_CUSTOM_VAR"];

function pickEnvForLog(env) {
  const out = {};
  for (const key of EXPECTED_KEYS) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      out[key] = env[key];
    } else {
      out[key] = "<missing>";
    }
  }
  return out;
}

console.log("[MRE 6499] At module load, custom env vars:", JSON.stringify(pickEnvForLog(process.env)));

exports.logEnv = functions.https.onRequest((req, res) => {
  const envSnapshot = pickEnvForLog(process.env);
  console.log("[MRE 6499] Inside request handler, custom env vars:", JSON.stringify(envSnapshot));
  res.set("Content-Type", "application/json");
  res.send(
    JSON.stringify(
      {
        message: "MRE for issue #6499 - check emulator logs for process.env",
        customEnvAtHandler: envSnapshot,
        allEnvKeysAtHandler: Object.keys(process.env).filter((k) =>
          EXPECTED_KEYS.includes(k)
        ),
      },
      null,
      2
    )
  );
});
