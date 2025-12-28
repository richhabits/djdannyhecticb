import * as db from "../db";
import { isAiStudioEnabled } from "./aiProviders";

const PROMO_AUTOPOST_ENABLED = process.env.PROMO_AUTOPOST_ENABLED !== "false";
const PROMO_AUTOPOST_INTERVAL_MS = Number(process.env.PROMO_AUTOPOST_INTERVAL_MS ?? 20000);
const PROMO_AUTOPOST_BATCH = Number(process.env.PROMO_AUTOPOST_BATCH ?? 5);
const PROMO_AUTOPOST_BASE_URL =
  process.env.PROMO_AUTOPOST_BASE_URL?.replace(/\/+$/, "") || "https://promo.hectic.fm";

let intervalHandle: NodeJS.Timer | undefined;
let busy = false;

export function startPromoAutoPoster() {
  if (!PROMO_AUTOPOST_ENABLED) {
    console.log("[AI] Promo autoposter disabled via PROMO_AUTOPOST_ENABLED=false");
    return;
  }

  const tick = async () => {
    if (busy) return;
    busy = true;
    try {
      await runCycle();
    } catch (error) {
      console.error("[AI] Promo autoposter failed:", error);
    } finally {
      busy = false;
    }
  };

  intervalHandle = setInterval(tick, PROMO_AUTOPOST_INTERVAL_MS);
  tick();

  console.log(
    `[AI] Promo autoposter started (interval=${PROMO_AUTOPOST_INTERVAL_MS}ms, batch=${PROMO_AUTOPOST_BATCH})`
  );
}

export function stopPromoAutoPoster() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = undefined;
    console.log("[AI] Promo autoposter stopped");
  }
}

async function runCycle() {
  if (!(await isAiStudioEnabled())) return;
  const items = await db.listAutoPostableContent(PROMO_AUTOPOST_BATCH);
  if (items.length === 0) return;

  for (const item of items) {
    try {
      const payload = parsePayload(item.payload);
      if (!payload.autoPost) {
        continue;
      }
      const externalUrl = buildShareUrl(item.id, item.targetPlatform);
      await db.updateContentItemStatus(item.id, "posted", externalUrl);
      console.log(
        `[AI] Auto-posted promo content ${item.id} to ${item.targetPlatform} (${externalUrl})`
      );
    } catch (error) {
      console.error(`[AI] Failed autopost for content ${item.id}:`, error);
    }
  }
}

function parsePayload(raw?: string | null) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function buildShareUrl(id: number, platform: string) {
  return `${PROMO_AUTOPOST_BASE_URL}/${platform}/${id}`;
}
