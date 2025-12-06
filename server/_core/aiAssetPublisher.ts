import * as db from "../db";
import { InsertContentQueueItem } from "../../drizzle/schema";

type ScriptJob = NonNullable<Awaited<ReturnType<typeof db.getAIScriptJob>>>;

export async function publishVoiceJobAsset(jobId: number, audioUrl: string) {
  const job = await db.getAIVoiceJob(jobId);
  if (!job || !job.scriptJobId) return;

  const scriptJob = await db.getAIScriptJob(job.scriptJobId);
  if (!scriptJob || scriptJob.status !== "completed") return;

  if (scriptJob.type === "fanShout") {
    await enqueueFanShoutAsset({
      jobType: "voice",
      scriptJob,
      media: { audioUrl },
      sourceId: jobId,
    });
  }
}

export async function publishVideoJobAsset(
  jobId: number,
  asset: { videoUrl: string; thumbnailUrl?: string }
) {
  const job = await db.getAIVideoJob(jobId);
  if (!job || !job.scriptJobId) return;

  const scriptJob = await db.getAIScriptJob(job.scriptJobId);
  if (!scriptJob || scriptJob.status !== "completed") return;

  if (scriptJob.type === "fanShout") {
    await enqueueFanShoutAsset({
      jobType: "video",
      scriptJob,
      media: { ...asset, stylePreset: job.stylePreset },
      sourceId: jobId,
    });
  }
}

async function enqueueFanShoutAsset(options: {
  jobType: "voice" | "video";
  scriptJob: ScriptJob;
  media: Record<string, unknown>;
  sourceId: number;
}) {
  const { scriptJob, jobType, media, sourceId } = options;

  const existing = await db.getContentItemBySource("aiJob", sourceId);
  if (existing) return;

  const context = parseContext(scriptJob.inputContext);
  const shoutData = context.shoutData || {};
  const title = buildShoutTitle(shoutData);
  const targetPlatform = jobType === "video"
    ? mapStyleToPlatform((media as any).stylePreset)
    : "multi";

  const payload = JSON.stringify({
    kind: jobType,
    scriptJobId: scriptJob.id,
    resultText: scriptJob.resultText,
    shoutData,
    media,
  });

  const item: InsertContentQueueItem = {
    type: "clip",
    title,
    description: scriptJob.resultText || undefined,
    targetPlatform,
    source: "aiJob",
    sourceId,
    status: "draft",
    payload,
  };

  await db.createContentItem(item);
}

function parseContext(raw?: string | null) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function buildShoutTitle(shoutData: Record<string, unknown>) {
  const name = typeof shoutData?.["name"] === "string" ? shoutData["name"] : undefined;
  const vibe = typeof shoutData?.["vibe"] === "string" ? shoutData["vibe"] : undefined;
  if (name && vibe) return `AI Shout for ${name} (${vibe})`;
  if (name) return `AI Shout for ${name}`;
  return "AI Shout Highlight";
}

function mapStyleToPlatform(style?: string): InsertContentQueueItem["targetPlatform"] {
  switch (style) {
    case "verticalShort":
      return "tiktok";
    case "squareClip":
      return "instagram";
    case "horizontalHost":
    default:
      return "youtube";
  }
}
