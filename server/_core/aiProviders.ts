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
  text?: string; // For D-ID compatibility
  imageUrl?: string; // For D-ID compatibility
  avatarUrl?: string; // For D-ID compatibility
  voiceId?: string; // For D-ID compatibility
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
 * OpenAI Chat Completion (real implementation)
 */
async function chatCompletionOpenAI(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[AI] OPENAI_API_KEY not configured, using mock");
    return await chatCompletionMock(request);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model || "gpt-4",
        messages: request.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0]?.message?.content || "",
      provider: "openai",
      model: data.model || request.model || "gpt-4",
    };
  } catch (error) {
    console.error("[AI] OpenAI API call failed:", error);
    // Fallback to mock on error
    return await chatCompletionMock(request);
  }
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
 * ElevenLabs TTS (real implementation)
 */
async function ttsElevenLabs(request: TTSRequest): Promise<TTSResponse> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.warn("[AI] ELEVENLABS_API_KEY not configured, using mock");
    return await ttsMock(request);
  }

  try {
    const voiceId = request.voiceId || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Default voice
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: request.text,
        model_id: request.modelId || "eleven_monolingual_v1",
        voice_settings: {
          stability: request.stability || 0.5,
          similarity_boost: request.similarityBoost || 0.75,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    // Get audio blob
    const audioBlob = await response.blob();
    // In a real implementation, you'd upload this to S3 or storage
    // For now, return a placeholder URL
    const jobId = `elevenlabs-${Date.now()}`;
    const audioUrl = `/api/ai-voice/${jobId}.mp3`; // This would be the actual storage URL

    return {
      audioUrl,
      provider: "elevenlabs",
      duration: Math.ceil(request.text.length / 10), // Rough estimate
    };
  } catch (error) {
    console.error("[AI] ElevenLabs API call failed:", error);
    // Fallback to mock on error
    return await ttsMock(request);
  }
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
 * D-ID Video Host (real implementation)
 */
async function videoHostDID(request: VideoHostRequest): Promise<VideoHostResponse> {
  const apiKey = process.env.DID_API_KEY;
  if (!apiKey) {
    console.warn("[AI] DID_API_KEY not configured, using mock");
    return await videoHostMock(request);
  }

  try {
    // Create a talk
    const createResponse = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
      },
      body: JSON.stringify({
        source_url: request.imageUrl || request.avatarUrl || "https://d-id-public-bucket.s3.amazonaws.com/default-avatar.jpg",
        script: {
          type: "text",
          input: request.text || request.script,
          provider: {
            type: "microsoft",
            voice_id: request.voiceId || "en-US-AriaNeural",
          },
        },
        config: {
          stitch: true,
        },
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`D-ID API error: ${error}`);
    }

    const createData = await createResponse.json();
    const jobId = createData.id;

    // Poll for completion (in production, use webhooks)
    let status = "created";
    let attempts = 0;
    while (status !== "done" && attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const statusResponse = await fetch(`https://api.d-id.com/talks/${jobId}`, {
        headers: {
          "Authorization": `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
        },
      });
      const statusData = await statusResponse.json();
      status = statusData.status;
      attempts++;

      if (status === "done") {
        return {
          videoUrl: statusData.result_url,
          provider: "d-id",
          jobId,
          duration: statusData.duration || 0,
        };
      }
    }

    throw new Error("D-ID video generation timeout");
  } catch (error) {
    console.error("[AI] D-ID API call failed:", error);
    // Fallback to mock on error
    return await videoHostMock(request);
  }
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

