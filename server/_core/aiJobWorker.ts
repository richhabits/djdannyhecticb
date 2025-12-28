import { processAiScriptJob } from "./aiScriptFactory";
import { processAiVoiceJob } from "./aiVoiceFactory";
import { processAiVideoJob } from "./aiVideoFactory";
import { areFanFacingAiToolsEnabled, isAiStudioEnabled } from "./aiProviders";
import * as db from "../db";

type JobType = "script" | "voice" | "video";

const WORKER_ENABLED = process.env.AI_WORKER_ENABLED !== "false";
const WORKER_INTERVAL_MS = Number(process.env.AI_WORKER_INTERVAL_MS ?? 15000);
const SCRIPT_BATCH = Number(process.env.AI_WORKER_SCRIPT_BATCH ?? 3);
const VOICE_BATCH = Number(process.env.AI_WORKER_VOICE_BATCH ?? 2);
const VIDEO_BATCH = Number(process.env.AI_WORKER_VIDEO_BATCH ?? 1);

let intervalHandle: NodeJS.Timer | undefined;
let ticking = false;

export function startAiJobWorker() {
  if (!WORKER_ENABLED) {
    console.log("[AI] Job worker disabled via AI_WORKER_ENABLED=false");
    return;
  }

  const tick = async () => {
    if (ticking) return;
    ticking = true;
    try {
      await runWorkerCycle();
    } catch (error) {
      console.error("[AI] Job worker cycle failed:", error);
    } finally {
      ticking = false;
    }
  };

  intervalHandle = setInterval(tick, WORKER_INTERVAL_MS);
  tick(); // kick off immediately

  console.log(
    `[AI] Job worker started (interval=${WORKER_INTERVAL_MS}ms, batches: script=${SCRIPT_BATCH}, voice=${VOICE_BATCH}, video=${VIDEO_BATCH})`
  );
}

export function stopAiJobWorker() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = undefined;
    console.log("[AI] Job worker stopped");
  }
}

async function runWorkerCycle() {
  if (!(await isAiStudioEnabled())) {
    return;
  }

  await Promise.all([
    drainScripts(),
    drainVoice(),
    drainVideo(),
  ]);
}

async function drainScripts() {
  const pending = await db.listAIScriptJobs({ status: "pending" }, SCRIPT_BATCH);
  if (pending.length === 0) return;

  const fanFacingEnabled = await areFanFacingAiToolsEnabled();

  for (const job of pending) {
    if (job.type === "fanShout" && !fanFacingEnabled) {
      continue;
    }
    await processSafe(() => processAiScriptJob(job.id), "script", job.id);
  }
}

async function drainVoice() {
  const pending = await db.listAIVoiceJobs({ status: "pending" }, VOICE_BATCH);
  for (const job of pending) {
    await processSafe(() => processAiVoiceJob(job.id), "voice", job.id);
  }
}

async function drainVideo() {
  const pending = await db.listAIVideoJobs({ status: "pending" }, VIDEO_BATCH);
  for (const job of pending) {
    await processSafe(() => processAiVideoJob(job.id), "video", job.id);
  }
}

async function processSafe(fn: () => Promise<unknown>, type: JobType, id: number) {
  try {
    await fn();
  } catch (error) {
    console.error(`[AI] Failed to process ${type} job ${id}:`, error);
  }
}
