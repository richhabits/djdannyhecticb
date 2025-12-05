import { Worker } from "bullmq";
import { getMusicQueueConnection, MusicSyncTarget } from "../_core/musicJobs";
import { QUEUE_NAMES } from "../_core/queue";
import { syncSpotifyContent, syncYouTubeContent } from "../_core/musicSync";

interface MusicSyncJobData {
  target: MusicSyncTarget;
  enqueuedAt?: string;
}

const worker = new Worker<MusicSyncJobData>(
  QUEUE_NAMES.MUSIC_SYNC,
  async (job) => {
    const target = job.data.target ?? "all";
    const results: Record<string, unknown> = {};

    if (target === "spotify" || target === "all") {
      results.spotify = await syncSpotifyContent();
    }

    if (target === "youtube" || target === "all") {
      results.youtube = await syncYouTubeContent();
    }

    return results;
  },
  {
    connection: getMusicQueueConnection(),
    concurrency: 2,
  }
);

worker.on("completed", (job, result) => {
  console.log(`[Worker] Music sync job ${job.id} completed`, result);
});

worker.on("failed", (job, error) => {
  console.error(`[Worker] Music sync job ${job?.id} failed`, error);
});
