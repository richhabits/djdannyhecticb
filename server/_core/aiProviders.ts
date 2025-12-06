import OpenAI from 'openai';
import { Replicate } from 'replicate';
import { ENV } from './env';

let openai: OpenAI | null = null;
let replicate: Replicate | null = null;

/**
 * Initialize OpenAI client
 */
export function getOpenAI(): OpenAI | null {
  if (!ENV.openaiApiKey) {
    console.warn('[OpenAI] Not configured - OPENAI_API_KEY missing');
    return null;
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey: ENV.openaiApiKey,
    });
  }

  return openai;
}

/**
 * Initialize Replicate client
 */
export function getReplicate(): Replicate | null {
  if (!ENV.replicateApiKey) {
    console.warn('[Replicate] Not configured - REPLICATE_API_KEY missing');
    return null;
  }

  if (!replicate) {
    replicate = new Replicate({
      auth: ENV.replicateApiKey,
    });
  }

  return replicate;
}

/**
 * Generate text using OpenAI
 */
export async function generateText(params: {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const client = getOpenAI();
  if (!client) {
    throw new Error('OpenAI is not configured');
  }

  const completion = await client.chat.completions.create({
    model: params.model || ENV.openaiModel || 'gpt-4o',
    messages: [
      ...(params.systemPrompt ? [{ role: 'system' as const, content: params.systemPrompt }] : []),
      { role: 'user' as const, content: params.prompt },
    ],
    temperature: params.temperature ?? 0.7,
    max_tokens: params.maxTokens ?? 1000,
  });

  return completion.choices[0]?.message?.content || '';
}

/**
 * Generate voice using ElevenLabs API
 */
export async function generateVoice(params: {
  text: string;
  voiceId?: string;
}): Promise<string> {
  if (!ENV.elevenlabsApiKey) {
    throw new Error('ElevenLabs is not configured');
  }

  const voiceId = params.voiceId || ENV.elevenlabsVoiceId || '21m00Tcm4TlvDq8ikWAM';
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ENV.elevenlabsApiKey,
    },
    body: JSON.stringify({
      text: params.text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  // Convert audio to base64 for storage
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  
  return `data:audio/mpeg;base64,${base64}`;
}

/**
 * Generate video using Replicate
 */
export async function generateVideo(params: {
  prompt: string;
  imageUrl?: string;
}): Promise<string> {
  const client = getReplicate();
  if (!client) {
    throw new Error('Replicate is not configured');
  }

  // Using Stable Video Diffusion for video generation
  const output = await client.run(
    "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
    {
      input: {
        input_image: params.imageUrl || '',
        sizing_strategy: "maintain_aspect_ratio",
        frames_per_second: 24,
        motion_bucket_id: 127,
      }
    }
  ) as string;

  return output;
}

/**
 * Generate image using Replicate (FLUX model)
 */
export async function generateImage(params: {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  outputFormat?: 'webp' | 'jpg' | 'png';
}): Promise<string> {
  const client = getReplicate();
  if (!client) {
    throw new Error('Replicate is not configured');
  }

  // Using FLUX Schnell for fast image generation
  const output = await client.run(
    "black-forest-labs/flux-schnell",
    {
      input: {
        prompt: params.prompt,
        aspect_ratio: params.aspectRatio || '16:9',
        output_format: params.outputFormat || 'webp',
        output_quality: 90,
      }
    }
  ) as string[];

  return output[0] || '';
}

/**
 * Transcribe audio using OpenAI Whisper
 */
export async function transcribeAudio(params: {
  audioFile: File | Buffer;
  language?: string;
}): Promise<string> {
  const client = getOpenAI();
  if (!client) {
    throw new Error('OpenAI is not configured');
  }

  const transcription = await client.audio.transcriptions.create({
    file: params.audioFile as any,
    model: 'whisper-1',
    language: params.language || 'en',
  });

  return transcription.text;
}

/**
 * Generate embeddings for semantic search
 */
export async function generateEmbeddings(text: string): Promise<number[]> {
  const client = getOpenAI();
  if (!client) {
    throw new Error('OpenAI is not configured');
  }

  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Moderate content using OpenAI
 */
export async function moderateContent(text: string): Promise<{
  flagged: boolean;
  categories: Record<string, boolean>;
}> {
  const client = getOpenAI();
  if (!client) {
    throw new Error('OpenAI is not configured');
  }

  const moderation = await client.moderations.create({
    input: text,
  });

  const result = moderation.results[0];
  
  return {
    flagged: result.flagged,
    categories: result.categories as Record<string, boolean>,
  };
}

/**
 * Chat completion with streaming support
 */
export async function* streamChatCompletion(params: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  model?: string;
  temperature?: number;
}) {
  const client = getOpenAI();
  if (!client) {
    throw new Error('OpenAI is not configured');
  }

  const stream = await client.chat.completions.create({
    model: params.model || ENV.openaiModel || 'gpt-4o',
    messages: params.messages,
    temperature: params.temperature ?? 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
