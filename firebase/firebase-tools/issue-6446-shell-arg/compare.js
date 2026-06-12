"use strict";

const { spawn } = require("child_process");

function normalizeBeforeFix(args) {
  args = [...args];
  let index;
  if ((index = args.indexOf("-c")) !== -1) {
    args.splice(index, 1);
  }
  return args;
}

function normalizeAfterFix(args) {
  args = [...args];
  const index = args.indexOf("-c");
  if (index !== -1) {
    args.splice(index, 1);
    if (args[index] === "--") {
      args.splice(index, 1);
    }
  }
  return args;
}

function runWithShell(normalized) {
  return new Promise((resolve) => {
    const child = spawn(normalized[0], normalized.slice(1), {
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("exit", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function runCase(label, normalize) {
  const rawArgs = ["-c", "--", "echo issue-6446-repro"];
  const normalized = normalize(rawArgs);
  const result = await runWithShell(normalized);

  console.log(`\n[${label}]`);
  console.log(`raw args       ${JSON.stringify(rawArgs)}`);
  console.log(`normalized     ${JSON.stringify(normalized)}`);
  console.log(`exit code      ${result.code}`);
  if (result.stdout.trim()) {
    console.log("stdout");
    console.log(result.stdout.trimEnd());
  }
  if (result.stderr.trim()) {
    console.log("stderr");
    console.log(result.stderr.trimEnd());
  }
}

async function main() {
  console.log("Minimal repro for firebase-tools issue #6446 shell argument bug");
  await runCase("before-fix", normalizeBeforeFix);
  await runCase("after-fix", normalizeAfterFix);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
