/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * AI Provider Abstraction Layer
 * 
 * Provider-agnostic interface for AI operations (LLM, TTS, Video Host)
 * Supports multiple providers with fallback to mock
 */

import { observability } from "./observability";

export type AiModelType = "chat" | "tts" | "videoHost";
export type AiProvider = "openai" | "elevenlabs" | "d-id" | "custom" | "mock" | "none" | "gemini" | "groq" | "huggingface" | "cohere" | "ollama";

export interface ChatCompletionRequest {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  persona?: string; // Danny's persona context
  temperature?: number;
  maxTokens?: number;
}

export interface ChatCompletionResponse {
  text: string;
  provider: AiProvider;
  model?: string;
}

export interface TTSRequest {
  text: string;
  voiceId: string;
  language?: string;
  speed?: number;
}

export interface TTSResponse {
  audioUrl: string;
  provider: AiProvider;
  duration?: number;
}

export interface VideoHostRequest {
  script: string;
  stylePreset: "verticalShort" | "squareClip" | "horizontalHost";
  voiceProfile?: string;
}

export interface VideoHostResponse {
  videoUrl: string;
  thumbnailUrl?: string;
  provider: AiProvider;
  duration?: number;
}

/**
 * Get provider from settings or env
 */
export async function getAiProvider(type: AiModelType): Promise<AiProvider> {
  // Try to get from empireSettings first
  try {
    const { getEmpireSetting } = await import("../db");
    const setting = await getEmpireSetting(`ai_${type}_provider`);
    if (setting?.value) {
      const provider = JSON.parse(setting.value) as AiProvider;
      if (provider && provider !== "none") return provider;
    }
  } catch (error) {
    console.warn("[AI] Failed to get provider from settings:", error);
  }

  // Fallback to env vars
  const envKey = `AI_${type.toUpperCase()}_PROVIDER`;
  const envProvider = process.env[envKey] as AiProvider | undefined;
  if (envProvider && envProvider !== "none") return envProvider;

  // Default to mock for development
  return "mock";
}

/**
 * Chat completion (LLM)
 */
export async function chatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const provider = await getAiProvider("chat");

  switch (provider) {
    case "openai":
      return await chatCompletionOpenAI(request);
    case "gemini":
      const { chatCompletionGemini } = await import("./aiProvidersFree");
      return await chatCompletionGemini(request);
    case "groq":
      const { chatCompletionGroq } = await import("./aiProvidersFree");
      return await chatCompletionGroq(request);
    case "huggingface":
      const { chatCompletionHuggingFace } = await import("./aiProvidersFree");
      return await chatCompletionHuggingFace(request);
    case "cohere":
      const { chatCompletionCohere } = await import("./aiProvidersFree");
      return await chatCompletionCohere(request);
    case "ollama":
      const { chatCompletionOllama } = await import("./aiProvidersFree");
      return await chatCompletionOllama(request);
    case "mock":
      const res = await chatCompletionMock(request);
      observability.recordAiUsage("mock");
      return res;
    default:
      // Try to use best available free provider
      try {
        const { getBestFreeProvider, chatCompletionGemini, chatCompletionGroq, chatCompletionHuggingFace, chatCompletionCohere, chatCompletionOllama } = await import("./aiProvidersFree");
        const bestProvider = await getBestFreeProvider();
        let result;
        switch (bestProvider) {
          case "groq":
            result = await chatCompletionGroq(request); break;
          case "gemini":
            result = await chatCompletionGemini(request); break;
          case "huggingface":
            result = await chatCompletionHuggingFace(request); break;
          case "cohere":
            result = await chatCompletionCohere(request); break;
          case "ollama":
            result = await chatCompletionOllama(request); break;
          default:
            result = await chatCompletionMock(request);
        }
        observability.recordAiUsage(bestProvider, true); // Mark as fallback
        return result;
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[AI] Provider ${provider} not implemented, using mock:`, error);
        }
        observability.recordAiUsage("mock", true);
        return await chatCompletionMock(request);
      }
  }
}

/**
 * Text-to-Speech
 */
export async function textToSpeech(request: TTSRequest): Promise<TTSResponse> {
  const provider = await getAiProvider("tts");

  switch (provider) {
    case "elevenlabs":
      return await ttsElevenLabs(request);
    case "mock":
      return await ttsMock(request);
    default:
      console.warn(`[AI] Provider ${provider} not implemented, using mock`);
      return await ttsMock(request);
  }
}

/**
 * Video Host Generation
 */
export async function generateVideoHost(
  request: VideoHostRequest
): Promise<VideoHostResponse> {
  const provider = await getAiProvider("videoHost");

  switch (provider) {
    case "d-id":
      return await videoHostDID(request);
    case "mock":
      return await videoHostMock(request);
    default:
      console.warn(`[AI] Provider ${provider} not implemented, using mock`);
      return await videoHostMock(request);
  }
}

// ============================================
// Provider Implementations
// ============================================

/**
 * OpenAI Chat Completion (stub - ready for real integration)
 */
async function chatCompletionOpenAI(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  // TODO: Implement real OpenAI API call
  // const apiKey = process.env.OPENAI_API_KEY;
  // if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  // For now, fallback to mock
  return await chatCompletionMock(request);
}

/**
 * Mock Chat Completion
 */
async function chatCompletionMock(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const lastMessage = request.messages[request.messages.length - 1]?.content || "";
  const persona = request.persona || "Danny Hectic B";

  // Generate a mock response based on context
  let mockResponse = "";
  if (lastMessage.toLowerCase().includes("shout")) {
    mockResponse = `Yo, it's ${persona}! That's a sick shout fam, you're locked in! Keep the energy up and stay Hectic! 🔥`;
  } else if (lastMessage.toLowerCase().includes("track") || lastMessage.toLowerCase().includes("song")) {
    mockResponse = `That track is fire! I'll make sure to get that in the mix. The culture needs to hear this!`;
  } else if (lastMessage.toLowerCase().includes("event") || lastMessage.toLowerCase().includes("show")) {
    mockResponse = `Big things coming! Make sure you're locked in for the next Hectic event. It's gonna be legendary!`;
  } else {
    mockResponse = `Yo, it's ${persona}! You're asking about something Hectic, and I'm here for it. Let's keep the energy up and stay locked in! 🔥`;
  }

  return {
    text: mockResponse,
    provider: "mock",
    model: "mock-gpt-4",
  };
}

/**
 * ElevenLabs TTS (stub - ready for real integration)
 */
async function ttsElevenLabs(request: TTSRequest): Promise<TTSResponse> {
  // TODO: Implement real ElevenLabs API call
  // const apiKey = process.env.ELEVENLABS_API_KEY;
  // if (!apiKey) throw new Error("ELEVENLABS_API_KEY not configured");

  // For now, fallback to mock
  return await ttsMock(request);
}

/**
 * Mock TTS
 */
async function ttsMock(request: TTSRequest): Promise<TTSResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Generate a mock audio URL
  const jobId = `mock-${Date.now()}`;
  const audioUrl = `/mock-audio/ai-voice-job-${jobId}.mp3`;

  return {
    audioUrl,
    provider: "mock",
    duration: Math.ceil(request.text.length / 10), // Rough estimate: 10 chars per second
  };
}

/**
 * D-ID Video Host (stub - ready for real integration)
 */
async function videoHostDID(request: VideoHostRequest): Promise<VideoHostResponse> {
  // TODO: Implement real D-ID API call
  // const apiKey = process.env.DID_API_KEY;
  // if (!apiKey) throw new Error("DID_API_KEY not configured");

  // For now, fallback to mock
  return await videoHostMock(request);
}

/**
 * Mock Video Host
 */
async function videoHostMock(request: VideoHostRequest): Promise<VideoHostResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Generate mock URLs
  const jobId = `mock-${Date.now()}`;
  const videoUrl = `/mock-video/ai-video-job-${jobId}.mp4`;
  const thumbnailUrl = `/mock-thumbnails/ai-video-job-${jobId}.jpg`;

  return {
    videoUrl,
    thumbnailUrl,
    provider: "mock",
    duration: Math.ceil(request.script.length / 10), // Rough estimate
  };
}

/**
 * Check if AI Studio is enabled
 */
export async function isAiStudioEnabled(): Promise<boolean> {
  try {
    const { getEmpireSetting } = await import("../db");
    const setting = await getEmpireSetting("ai_studio_enabled");
    if (setting?.value) {
      const enabled = JSON.parse(setting.value) as boolean;
      return enabled !== false; // Default to true if not set
    }
  } catch (error) {
    console.warn("[AI] Failed to check AI Studio enabled:", error);
  }
  return true; // Default enabled
}

/**
 * Check if fan-facing AI tools are enabled
 */
export async function areFanFacingAiToolsEnabled(): Promise<boolean> {
  try {
    const { getEmpireSetting } = await import("../db");
    const setting = await getEmpireSetting("fan_facing_ai_enabled");
    if (setting?.value) {
      const enabled = JSON.parse(setting.value) as boolean;
      return enabled === true;
    }
  } catch (error) {
    console.warn("[AI] Failed to check fan-facing AI enabled:", error);
  }
  return false; // Default disabled for safety
}

