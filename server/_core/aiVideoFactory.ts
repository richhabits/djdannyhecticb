/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * AI Video Factory
 * 
 * Generates video clips from scripts using video host AI
 */

import { generateVideoHost, VideoHostRequest } from "./aiProviders";
import * as db from "../db";
import { InsertAIVideoJob } from "../../drizzle/schema";

export type StylePreset = "verticalShort" | "squareClip" | "horizontalHost";

/**
 * Create an AI video job
 */
export async function createAiVideoJob(
  options: {
    scriptJobId: number;
    stylePreset: StylePreset;
    userId?: number;
  }
): Promise<number> {
  // Verify script job exists and is completed
  const scriptJob = await db.getAIScriptJob(options.scriptJobId);
  if (!scriptJob || scriptJob.status !== "completed" || !scriptJob.resultText) {
    throw new Error("Script job not found or not completed");
  }

  const job = await db.createAIVideoJob({
    scriptJobId: options.scriptJobId,
    stylePreset: options.stylePreset,
    requestedByUserId: options.userId,
    status: "pending",
  });

  return job.id;
}

/**
 * Process an AI video job
 */
export async function processAiVideoJob(jobId: number): Promise<{ videoUrl: string; thumbnailUrl?: string }> {
  const job = await db.getAIVideoJob(jobId);
  if (!job) throw new Error("Video job not found");

  // Update status to processing
  await db.updateAIVideoJob(jobId, { status: "processing" });

  try {
    // Get script text from script job
    if (!job.scriptJobId) {
      throw new Error("Script job ID required");
    }

    const scriptJob = await db.getAIScriptJob(job.scriptJobId);
    if (!scriptJob || !scriptJob.resultText) {
      throw new Error("Script job not found or has no text");
    }

    const request: VideoHostRequest = {
      script: scriptJob.resultText,
      stylePreset: job.stylePreset,
      voiceProfile: "hectic_main", // Default, can be made configurable
    };

    const response = await generateVideoHost(request);

    // Update job with result
    await db.updateAIVideoJob(jobId, {
      status: "completed",
      videoUrl: response.videoUrl,
      thumbnailUrl: response.thumbnailUrl,
    });

    return {
      videoUrl: response.videoUrl,
      thumbnailUrl: response.thumbnailUrl,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await db.updateAIVideoJob(jobId, {
      status: "failed",
      errorMessage,
    });
    throw error;
  }
}

