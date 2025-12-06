import * as db from "../db";
import { InsertContentQueueItem } from "../../drizzle/schema";

type ScriptJob = NonNullable<Awaited<ReturnType<typeof db.getAIScriptJob>>>;

const PROMO_AUTOPOST_DELAY_MS = Number(process.env.PROMO_AUTOPOST_DELAY_MS ?? 600000);

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
  } else if (scriptJob.type === "promo") {
    await upsertPromoAsset(scriptJob, payload => ({
      ...payload,
      voice: {
        audioUrl,
        voiceProfile: job.voiceProfile,
      },
    }));
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
  } else if (scriptJob.type === "promo") {
    const targetPlatform = mapStyleToPlatform(job.stylePreset);
    await upsertPromoAsset(
      scriptJob,
      payload => ({
        ...payload,
        video: {
          videoUrl: asset.videoUrl,
          thumbnailUrl: asset.thumbnailUrl,
          stylePreset: job.stylePreset,
        },
        autoPost: true,
      }),
      { schedule: true, targetPlatform }
    );
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

async function upsertPromoAsset(
  scriptJob: ScriptJob,
  patch: (payload: Record<string, unknown>) => Record<string, unknown>,
  options?: { schedule?: boolean; targetPlatform?: InsertContentQueueItem["targetPlatform"] }
) {
  const contentItem = await ensurePromoContentItem(scriptJob);
  const existingPayload = safeParsePayload(contentItem.payload);

  const nextPayload = patch(existingPayload || {});
  const updates: Partial<InsertContentQueueItem> = {
    payload: JSON.stringify(nextPayload),
  };

  if (options?.targetPlatform && options.targetPlatform !== contentItem.targetPlatform) {
    updates.targetPlatform = options.targetPlatform;
  }

  if (options?.schedule) {
    updates.status = "scheduled";
    updates.scheduledAt = new Date(Date.now() + PROMO_AUTOPOST_DELAY_MS);
  }

  await db.updateContentItem(contentItem.id, updates);
}

async function ensurePromoContentItem(scriptJob: ScriptJob) {
  const existing = await db.getContentItemBySource("aiJob", scriptJob.id);
  if (existing) return existing;

  const context = parseContext(scriptJob.inputContext);
  const title = buildPromoTitle(context);
  const targetPlatform = mapPromoPlatform(context.platform);

  const payload = {
    scriptJobId: scriptJob.id,
    scriptText: scriptJob.resultText,
    eventInfo: context.eventInfo,
    platform: context.platform,
    callToAction: Array.isArray(context.keywords) ? context.keywords[0] : undefined,
  };

  return await db.createContentItem({
    type: "post",
    title,
    description: scriptJob.resultText || undefined,
    targetPlatform,
    source: "aiJob",
    sourceId: scriptJob.id,
    status: "draft",
    payload: JSON.stringify(payload),
  });
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

function mapPromoPlatform(platform?: unknown): InsertContentQueueItem["targetPlatform"] {
  const value = typeof platform === "string" ? platform.toLowerCase() : "";
  const allowed: InsertContentQueueItem["targetPlatform"][] = [
    "instagram",
    "tiktok",
    "youtube",
    "whatsapp",
    "telegram",
    "multi",
  ];
  if (allowed.includes(value as any)) {
    return value as InsertContentQueueItem["targetPlatform"];
  }
  return "multi";
}

function buildPromoTitle(context: Record<string, any>) {
  const title = context?.eventInfo?.title;
  if (typeof title === "string" && title.trim().length > 0) {
    return `Promo: ${title.trim()}`;
  }
  return "AI Promo Pack";
}

function safeParsePayload(raw?: string | null) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
