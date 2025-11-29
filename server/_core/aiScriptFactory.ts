/**
 * AI Script Factory
 * 
 * Generates scripts for various purposes using the AI provider abstraction
 */

import { chatCompletion, ChatCompletionRequest } from "./aiProviders";
import * as db from "../db";
import { InsertAIScriptJob } from "../../drizzle/schema";

export type ScriptType = "intro" | "outro" | "mixStory" | "tiktokClip" | "promo" | "fanShout" | "generic";

export interface ScriptContext {
  shoutData?: {
    name: string;
    location?: string;
    message: string;
    vibe?: string;
  };
  eventInfo?: {
    title: string;
    date: string;
    location?: string;
  };
  userInfo?: {
    name: string;
    level?: number;
    personaType?: string;
  };
  trackInfo?: {
    title: string;
    artist: string;
  };
  keywords?: string[];
  platform?: string;
}

/**
 * Create an AI script job
 */
export async function createAiScriptJob(
  type: ScriptType,
  context: ScriptContext,
  userId?: number
): Promise<number> {
  const job = await db.createAIScriptJob({
    type,
    inputContext: JSON.stringify(context),
    requestedByUserId: userId,
    status: "pending",
  });
  return job.id;
}

/**
 * Process an AI script job
 */
export async function processAiScriptJob(jobId: number): Promise<string> {
  const job = await db.getAIScriptJob(jobId);
  if (!job) throw new Error("Script job not found");

  // Update status to processing
  await db.updateAIScriptJob(jobId, { status: "processing" });

  try {
    const context = JSON.parse(job.inputContext || "{}") as ScriptContext;
    const prompt = buildPromptForType(job.type, context);
    
    const request: ChatCompletionRequest = {
      messages: [
        {
          role: "system",
          content: "You are DJ Danny Hectic B, a high-energy DJ and radio host. Keep responses authentic, hype, and in Danny's voice.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      persona: "Danny Hectic B",
      temperature: 0.8,
    };

    const response = await chatCompletion(request);
    
    // Update job with result
    await db.updateAIScriptJob(jobId, {
      status: "completed",
      resultText: response.text,
    });

    return response.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await db.updateAIScriptJob(jobId, {
      status: "failed",
      errorMessage,
    });
    throw error;
  }
}

/**
 * Build prompt based on script type and context
 */
function buildPromptForType(type: ScriptType, context: ScriptContext): string {
  switch (type) {
    case "intro":
      return `Write a hype intro script for Danny Hectic B. Keep it short (15-30 seconds), energetic, and authentic.${context.eventInfo ? ` Event: ${context.eventInfo.title}` : ""}`;
    
    case "outro":
      return `Write a closing outro script for Danny Hectic B. Thank listeners, hype up next shows, keep it short and energetic.`;
    
    case "mixStory":
      return `Write a story/narrative script for a DJ mix. Make it engaging, describe the vibe and energy.${context.trackInfo ? ` Include mention of: ${context.trackInfo.title} by ${context.trackInfo.artist}` : ""}`;
    
    case "tiktokClip":
      return `Write a TikTok/Reels script for Danny Hectic B.${context.keywords ? ` Include these keywords: ${context.keywords.join(", ")}` : ""}${context.platform ? ` Platform: ${context.platform}` : ""} Keep it punchy, hook viewers in the first 3 seconds, and include a call-to-action.`;
    
    case "promo":
      return `Write promotional copy for Danny Hectic B.${context.eventInfo ? ` Event: ${context.eventInfo.title} on ${context.eventInfo.date}` : ""} Make it exciting and shareable.`;
    
    case "fanShout":
      if (context.shoutData) {
        const vibe = context.shoutData.vibe || "Fun";
        return `Write a personalized shout script for ${context.shoutData.name}${context.shoutData.location ? ` from ${context.shoutData.location}` : ""}. Vibe: ${vibe}. Message: "${context.shoutData.message}". Make it authentic, hype, and in Danny's voice. Keep it 10-20 seconds.`;
      }
      return "Write a generic fan shout script in Danny's voice.";
    
    case "generic":
      return `Write a script in Danny Hectic B's voice.${context.keywords ? ` Include: ${context.keywords.join(", ")}` : ""}`;
    
    default:
      return "Write a script in Danny Hectic B's voice.";
  }
}

/**
 * Convenience functions for specific script types
 */
export async function generateIntroScript(context?: ScriptContext, userId?: number): Promise<number> {
  return await createAiScriptJob("intro", context || {}, userId);
}

export async function generateTikTokScript(
  keywords: string[],
  platform: string,
  userId?: number
): Promise<number> {
  return await createAiScriptJob("tiktokClip", { keywords, platform }, userId);
}

export async function generateFanShoutScript(
  shoutData: ScriptContext["shoutData"],
  userId?: number
): Promise<number> {
  return await createAiScriptJob("fanShout", { shoutData }, userId);
}

