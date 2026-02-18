import { onRequest } from "firebase-functions/v2/https";

const EXPECTED_KEYS = ["PLANET", "AUDIENCE", "MY_CUSTOM_VAR"] as const;

function pickEnvForLog(env: NodeJS.ProcessEnv): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of EXPECTED_KEYS) {
    if (Object.prototype.hasOwnProperty.call(env, key) && env[key] !== undefined) {
      out[key] = env[key] as string;
    } else {
      out[key] = "<missing>";
    }
  }
  return out;
}

console.log(
  "[MRE 6499] At module load, custom env vars:",
  JSON.stringify(pickEnvForLog(process.env))
);

export const logEnv = onRequest((req, res) => {
  const envSnapshot = pickEnvForLog(process.env);
  console.log(
    "[MRE 6499] Inside request handler, custom env vars:",
    JSON.stringify(envSnapshot)
  );
  res.set("Content-Type", "application/json");
  res.send(
    JSON.stringify(
      {
        message: "MRE for issue #6499 - check emulator logs for process.env (v2, TypeScript)",
        customEnvAtHandler: envSnapshot,
        allEnvKeysAtHandler: EXPECTED_KEYS.filter((k) =>
          Object.prototype.hasOwnProperty.call(process.env, k)
        ),
      },
      null,
      2
    )
  );
});
