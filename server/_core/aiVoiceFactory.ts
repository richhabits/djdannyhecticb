/**
 * AI Voice Factory
 * 
 * Generates voice audio from scripts using TTS
 */

import { textToSpeech, TTSRequest } from "./aiProviders";
import { publishVoiceJobAsset } from "./aiAssetPublisher";
import * as db from "../db";
import { InsertAIVoiceJob } from "../../drizzle/schema";

export type VoiceProfile = "hectic_main" | "hectic_soft" | "hectic_shouty";

/**
 * Create an AI voice job
 */
export async function createAiVoiceJob(
  options: {
    scriptJobId?: number;
    rawText?: string;
    voiceProfile?: VoiceProfile;
    userId?: number;
  }
): Promise<number> {
  // If scriptJobId provided, fetch the script text
  let text = options.rawText;
  if (options.scriptJobId && !text) {
    const scriptJob = await db.getAIScriptJob(options.scriptJobId);
    if (!scriptJob || scriptJob.status !== "completed" || !scriptJob.resultText) {
      throw new Error("Script job not found or not completed");
    }
    text = scriptJob.resultText;
  }

  if (!text) {
    throw new Error("Either scriptJobId or rawText must be provided");
  }

  const job = await db.createAIVoiceJob({
    scriptJobId: options.scriptJobId,
    rawText: text,
    voiceProfile: options.voiceProfile || "hectic_main",
    requestedByUserId: options.userId,
    status: "pending",
  });

  return job.id;
}

/**
 * Process an AI voice job
 */
export async function processAiVoiceJob(jobId: number): Promise<string> {
  const job = await db.getAIVoiceJob(jobId);
  if (!job) throw new Error("Voice job not found");

  // Update status to processing
  await db.updateAIVoiceJob(jobId, { status: "processing" });

  try {
    const text = job.rawText || "";
    if (!text) {
      throw new Error("No text to process");
    }

    // Get voice ID from settings or use default
    const voiceId = await getVoiceIdForProfile(job.voiceProfile);

    const request: TTSRequest = {
      text,
      voiceId,
      language: "en",
      speed: 1.0,
      jobId,
    };

    const response = await textToSpeech(request);

    // Update job with result
    await db.updateAIVoiceJob(jobId, {
      status: "completed",
      audioUrl: response.audioUrl,
    });

    await publishVoiceJobAsset(jobId, response.audioUrl);

    return response.audioUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await db.updateAIVoiceJob(jobId, {
      status: "failed",
      errorMessage,
    });
    throw error;
  }
}

/**
 * Get voice ID for a voice profile
 */
async function getVoiceIdForProfile(profile: string): Promise<string> {
  try {
    const { getEmpireSetting } = await import("../db");
    const setting = await getEmpireSetting(`voice_id_${profile}`);
    if (setting?.value) {
      return JSON.parse(setting.value) as string;
    }
  } catch (error) {
    console.warn(`[AI] Failed to get voice ID for ${profile}:`, error);
  }

  // Default voice IDs (mock)
  const defaults: Record<string, string> = {
    hectic_main: "mock-voice-hectic-main",
    hectic_soft: "mock-voice-hectic-soft",
    hectic_shouty: "mock-voice-hectic-shouty",
  };

  return defaults[profile] || defaults.hectic_main;
}

