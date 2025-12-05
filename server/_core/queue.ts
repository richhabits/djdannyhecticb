import { Queue, QueueOptions, QueueScheduler } from "bullmq";
import IORedis from "ioredis";

export const QUEUE_NAMES = {
  MUSIC_SYNC: "music-sync",
} as const;

let sharedConnection: IORedis | null = null;
const schedulers = new Map<string, QueueScheduler>();

function getRedisUrl() {
  return process.env.REDIS_URL || "redis://127.0.0.1:6379";
}

export function getRedisConnection(): IORedis {
  if (!sharedConnection) {
    sharedConnection = new IORedis(getRedisUrl(), {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    sharedConnection.on("error", (error) => {
      console.error("[Queue] Redis connection error:", error);
    });
  }
  return sharedConnection;
}

function ensureScheduler(name: string) {
  if (!schedulers.has(name)) {
    const scheduler = new QueueScheduler(name, {
      connection: getRedisConnection(),
    });
    scheduler.on("failed", (jobId, error) => {
      console.error(`[Queue] Scheduler error on ${name}`, jobId, error);
    });
    schedulers.set(name, scheduler);
  }
}

export function getQueue(name: string, options?: QueueOptions) {
  ensureScheduler(name);
  return new Queue(name, {
    connection: getRedisConnection(),
    ...(options ?? {}),
  });
}
