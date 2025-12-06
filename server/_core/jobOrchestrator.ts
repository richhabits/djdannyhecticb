import { QUEUE_NAMES, getQueue } from "./queue";
import type { MusicSyncTarget } from "./musicJobs";

const MUSIC_SYNC_CRON = process.env.MUSIC_SYNC_CRON || "0 * * * *";
const JOB_CRON_TZ = process.env.JOB_CRON_TZ || "UTC";

function isCronDisabled(value?: string | null) {
  return value?.toLowerCase() === "off" || value?.toLowerCase() === "false";
}

export async function initJobSchedules() {
  if (isCronDisabled(process.env.MUSIC_SYNC_CRON)) {
    console.log("[Jobs] MUSIC_SYNC_CRON disabled; skipping repeat schedule.");
    return;
  }

  await scheduleMusicSyncJob("all", MUSIC_SYNC_CRON, JOB_CRON_TZ);
}

async function scheduleMusicSyncJob(target: MusicSyncTarget, cron: string, tz: string) {
  const queue = getQueue(QUEUE_NAMES.MUSIC_SYNC);
  const jobId = `music-sync-cron-${cron}-${tz}`;

  await queue.add(
    "music-sync",
    {
      target,
      source: "cron",
    },
    {
      repeat: {
        pattern: cron,
        tz,
      },
      jobId,
      removeOnComplete: true,
    }
  );

  console.log("[Jobs] Ensured music sync repeat job", { cron, tz });
}
