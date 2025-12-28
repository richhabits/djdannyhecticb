import { storagePut } from "../storage";

/**
 * AI Provider Abstraction Layer
 * 
 * Provider-agnostic interface for AI operations (LLM, TTS, Video Host)
 * Supports multiple providers with fallback to mock
 */

export type AiModelType = "chat" | "tts" | "videoHost";
export type AiProvider = "openai" | "elevenlabs" | "d-id" | "custom" | "mock" | "none";

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
  jobId?: number;
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

const OPENAI_API_URL = (process.env.OPENAI_API_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
const DID_API_BASE = (process.env.DID_API_BASE || "https://api.d-id.com/v1").replace(/\/+$/, "");
const DID_STATUS_POLL_INTERVAL_MS = Number(process.env.DID_POLL_INTERVAL_MS ?? 2000);
const DID_STATUS_MAX_ATTEMPTS = Number(process.env.DID_STATUS_MAX_ATTEMPTS ?? 15);

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
    case "mock":
      return await chatCompletionMock(request);
    default:
      console.warn(`[AI] Provider ${provider} not implemented, using mock`);
      return await chatCompletionMock(request);
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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const model = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
  const payload: Record<string, unknown> = {
    model,
    messages: request.messages,
    temperature: request.temperature ?? 0.8,
  };
  if (typeof request.maxTokens === "number") {
    payload.max_tokens = request.maxTokens;
  }

  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `[OpenAI] Request failed (${response.status} ${response.statusText}): ${message}`
    );
  }

  const data = await response.json();
  const text =
    data?.choices?.[0]?.message?.content?.trim() ??
    data?.choices?.[0]?.delta?.content?.join("") ??
    "";

  if (!text) {
    throw new Error("[OpenAI] Empty response from chat completion");
  }

  return {
    text,
    provider: "openai",
    model: data?.model ?? model,
  };
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
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY not configured");
  }
  if (!request.voiceId) {
    throw new Error("voiceId is required for ElevenLabs TTS");
  }

  const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2";
  const stability = Number(process.env.ELEVENLABS_STABILITY ?? 0.58);
  const similarityBoost = Number(process.env.ELEVENLABS_SIMILARITY ?? 0.85);
  const style = Number(process.env.ELEVENLABS_STYLE ?? 0);
  const useSpeakerBoost = process.env.ELEVENLABS_SPEAKER_BOOST !== "false";

  const payload = {
    text: request.text,
    model_id: modelId,
    voice_settings: {
      stability,
      similarity_boost: similarityBoost,
      style,
      use_speaker_boost: useSpeakerBoost,
    },
    ...(request.language ? { language: request.language } : {}),
  };

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${request.voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `[ElevenLabs] Request failed (${response.status} ${response.statusText}): ${message}`
    );
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const fallbackUrl = `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;
  let audioUrl = fallbackUrl;

  try {
    const key = `ai/voice/${request.jobId || Date.now()}-${request.voiceId}.mp3`;
    const { url } = await storagePut(key, audioBuffer, "audio/mpeg");
    audioUrl = url;
  } catch (error) {
    console.warn("[AI] Failed to upload ElevenLabs audio to storage, using data URL", error);
  }

  return {
    audioUrl,
    provider: "elevenlabs",
    duration: Math.ceil(request.text.length / 12),
  };
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
  const apiKey = process.env.DID_API_KEY;
  if (!apiKey) {
    throw new Error("DID_API_KEY not configured");
  }

  const presenterPayload = resolveDidPresenterPayload();
  const authHeader = buildDidAuthHeader(apiKey);
  const voiceProvider = process.env.DID_VOICE_PROVIDER || "microsoft";
  const voiceId = resolveDidVoiceId(request.voiceProfile);
  const aspectRatio = resolveAspectRatio(request.stylePreset);

  const talkPayload: Record<string, unknown> = {
    script: {
      type: "text",
      input: request.script,
      provider: {
        type: voiceProvider,
        voice_id: voiceId,
      },
      ssml: false,
    },
    config: {
      result_format: "mp4",
      aspect_ratio: aspectRatio,
    },
    ...presenterPayload,
  };

  if (process.env.DID_DRIVER_ID) {
    (talkPayload as any).driver_id = process.env.DID_DRIVER_ID;
  }
  if (process.env.DID_DRIVER_URL) {
    (talkPayload as any).driver_url = process.env.DID_DRIVER_URL;
  }

  const response = await fetch(`${DID_API_BASE}/talks`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(talkPayload),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `[D-ID] Failed to start talk (${response.status} ${response.statusText}): ${message}`
    );
  }

  const creation = await response.json();
  if (!creation?.id) {
    throw new Error("[D-ID] Talk creation response missing id");
  }

  const finalStatus = await pollDidTalk(creation.id, authHeader);
  if (!finalStatus.result_url) {
    throw new Error("[D-ID] Talk completed without a video URL");
  }

  return {
    videoUrl: finalStatus.result_url,
    thumbnailUrl: finalStatus.thumbnail_url,
    provider: "d-id",
    duration: finalStatus.duration,
  };
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

type DidTalkStatus = {
  id: string;
  status: "created" | "started" | "done" | "error";
  result_url?: string;
  thumbnail_url?: string;
  duration?: number;
  error?: string;
};

function buildDidAuthHeader(rawKey: string): string {
  if (rawKey.startsWith("Basic ")) return rawKey;
  const keyWithSecret = rawKey.includes(":") ? rawKey : `${rawKey}:`;
  const encoded = Buffer.from(keyWithSecret).toString("base64");
  return `Basic ${encoded}`;
}

function resolveDidPresenterPayload(): { source_id?: string; source_url?: string } {
  const sourceId = process.env.DID_SOURCE_ID;
  const sourceUrl = process.env.DID_SOURCE_URL;
  if (!sourceId && !sourceUrl) {
    throw new Error("D-ID presenter not configured. Set DID_SOURCE_ID or DID_SOURCE_URL.");
  }
  return sourceId ? { source_id: sourceId } : { source_url: sourceUrl! };
}

function resolveDidVoiceId(profile?: string): string {
  const defaultVoice = process.env.DID_DEFAULT_VOICE_ID || "en-US-JennyNeural";
  if (!profile) return defaultVoice;
  const envKey = `DID_VOICE_${profile.replace(/[^a-z0-9]/gi, "_").toUpperCase()}`;
  return process.env[envKey] || defaultVoice;
}

function resolveAspectRatio(preset: VideoHostRequest["stylePreset"]): string {
  switch (preset) {
    case "verticalShort":
      return "9:16";
    case "squareClip":
      return "1:1";
    case "horizontalHost":
    default:
      return "16:9";
  }
}

async function pollDidTalk(id: string, authHeader: string): Promise<DidTalkStatus> {
  for (let attempt = 0; attempt < DID_STATUS_MAX_ATTEMPTS; attempt++) {
    const statusResponse = await fetch(`${DID_API_BASE}/talks/${id}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    });

    if (!statusResponse.ok) {
      const message = await statusResponse.text().catch(() => statusResponse.statusText);
      throw new Error(
        `[D-ID] Failed to fetch talk status (${statusResponse.status} ${statusResponse.statusText}): ${message}`
      );
    }

    const status = (await statusResponse.json()) as DidTalkStatus;
    if (status.status === "done" && status.result_url) {
      return status;
    }
    if (status.status === "error") {
      throw new Error(status.error || "[D-ID] Talk failed");
    }

    await sleep(DID_STATUS_POLL_INTERVAL_MS);
  }

  throw new Error("[D-ID] Talk generation timed out");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

