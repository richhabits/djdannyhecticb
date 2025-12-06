import { getQueue, getRedisConnection, QUEUE_NAMES } from "./queue";
import type { JobsOptions } from "bullmq";

export type MusicSyncTarget = "spotify" | "youtube" | "all";

const musicQueue = getQueue(QUEUE_NAMES.MUSIC_SYNC);

export async function enqueueMusicSync(
  target: MusicSyncTarget,
  options: JobsOptions = {}
) {
  return musicQueue.add(
    "music-sync",
    {
      target,
      enqueuedAt: new Date().toISOString(),
    },
    {
      removeOnComplete: true,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      ...options,
    }
  );
}

export function getMusicQueueConnection() {
  return getRedisConnection();
}
