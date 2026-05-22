#!/usr/bin/env node

function usage() {
  console.log(`Reproduce onCallGenkit disconnect blindness over raw callable SSE.

Environment:
  FUNCTION_URL                 Full callable URL. Recommended.

Or construct the URL from:
  FIREBASE_PROJECT_ID          Firebase project id
  FIREBASE_FUNCTIONS_REGION    Function region. Default: us-central1
  FUNCTION_NAME                Callable export name. Default: issue1888

Optional:
  ABORT_AFTER_MS               Abort the client after this many ms. Default: 5000
  TOTAL_STEPS                  Request totalSteps. Default: 30
  STEP_DELAY_MS                Request stepDelayMs. Default: 2000
  PROMPT                       Request prompt. Default: repro
  VERBOSE_SSE                  Set to 1 to log raw SSE frames

Examples:
  FUNCTION_URL=https://your-service-hash-uc.a.run.app npm run repro:oncallgenkit-disconnect
  FIREBASE_PROJECT_ID=your-project-id FIREBASE_FUNCTIONS_REGION=us-central1 FUNCTION_NAME=issue1888 npm run repro:oncallgenkit-disconnect

Notes:
  - This script assumes the callable does not require Auth or App Check.
  - It sends a direct callable POST with Accept: text/event-stream.
  - The reproduction is successful if the client aborts, but the server-side
    logs keep advancing through silent work until the next attempted chunk.
`);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  usage();
  process.exit(0);
}

function envNumber(name, fallback) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number, got: ${raw}`);
  }
  return value;
}

function resolveFunctionUrl() {
  if (process.env.FUNCTION_URL) {
    return process.env.FUNCTION_URL;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error(
      "Missing FUNCTION_URL or FIREBASE_PROJECT_ID. Run with --help for usage."
    );
  }

  const region = process.env.FIREBASE_FUNCTIONS_REGION || "us-central1";
  const functionName = process.env.FUNCTION_NAME || "issue1888";
  return `https://${region}-${projectId}.cloudfunctions.net/${functionName}`;
}

function parseSseFrames(buffer) {
  const frames = buffer.split("\n\n");
  return {
    frames: frames.slice(0, -1),
    rest: frames[frames.length - 1],
  };
}

function parseSseData(frame) {
  const lines = frame.split("\n");
  const dataLines = [];
  for (const line of lines) {
    if (line.startsWith(":")) {
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }
  if (dataLines.length === 0) {
    return null;
  }
  const raw = dataLines.join("\n");
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function main() {
  const functionUrl = resolveFunctionUrl();
  const abortAfterMs = envNumber("ABORT_AFTER_MS", 5000);
  const totalSteps = envNumber("TOTAL_STEPS", 30);
  const stepDelayMs = envNumber("STEP_DELAY_MS", 2000);
  const prompt = process.env.PROMPT || "repro";
  const verboseSse = process.env.VERBOSE_SSE === "1";

  const payload = {
    data: {
      prompt,
      totalSteps,
      stepDelayMs,
    },
  };

  const controller = new AbortController();
  const startedAt = Date.now();

  console.log("Starting streaming callable request");
  console.log("URL:", functionUrl);
  console.log("Payload:", JSON.stringify(payload));
  console.log(`Client will abort after ${abortAfterMs}ms`);

  const abortTimer = setTimeout(() => {
    const elapsed = Date.now() - startedAt;
    console.log(`Aborting client after ${elapsed}ms`);
    controller.abort(new Error("intentional client abort for reproduction"));
  }, abortAfterMs);

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    console.log("HTTP status:", response.status, response.statusText);
    console.log("Content-Type:", response.headers.get("content-type"));

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Non-2xx response: ${response.status} ${response.statusText}\n${text}`);
    }

    if (!response.body) {
      throw new Error("Response body is missing; cannot read SSE stream.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSseFrames(buffer);
      buffer = parsed.rest;

      for (const frame of parsed.frames) {
        if (!frame.trim()) {
          continue;
        }
        if (verboseSse) {
          console.log("Raw SSE frame:", JSON.stringify(frame));
        }
        const data = parseSseData(frame);
        if (data === null) {
          continue;
        }
        console.log("SSE:", JSON.stringify(data));
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      const data = parseSseData(buffer);
      if (data !== null) {
        console.log("SSE:", JSON.stringify(data));
      }
    }

    console.log("Stream ended without client-side abort.");
  } catch (err) {
    const elapsed = Date.now() - startedAt;
    if (controller.signal.aborted) {
      console.log(`Client observed abort after ${elapsed}ms`);
      console.log(
        "Check function logs now: the repro is confirmed if the flow keeps logging silent-work progress after this point."
      );
      return;
    }
    throw err;
  } finally {
    clearTimeout(abortTimer);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
