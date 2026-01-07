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
 * Free AI Provider Implementations
 * 
 * Implements free-tier AI models from various providers:
 * - Hugging Face Inference API (free tier)
 * - Groq (ultra-fast, free tier)
 * - Cohere (free tier)
 * - Ollama (local, completely free)
 * - Enhanced Gemini integration
 */

import type { ChatCompletionRequest, ChatCompletionResponse, AiProvider } from "./aiProviders";

/**
 * Hugging Face Inference API (Free Tier)
 * Models: meta-llama/Llama-3.1-8B-Instruct, mistralai/Mistral-7B-Instruct-v0.2, etc.
 */
export async function chatCompletionHuggingFace(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const apiKey = process.env.HUGGINGFACE_API_KEY || "";
  const model = process.env.HUGGINGFACE_MODEL || "meta-llama/Llama-3.1-8B-Instruct";
  
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY not configured");
  }

  try {
    // Format messages for Hugging Face
    const prompt = formatMessagesForHF(request.messages);
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            temperature: request.temperature || 0.7,
            max_new_tokens: request.maxTokens || 512,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hugging Face API error: ${error}`);
    }

    const data = await response.json();
    const text = Array.isArray(data) ? data[0]?.generated_text || "" : data.generated_text || "";

    return {
      text: text.trim(),
      provider: "huggingface" as AiProvider,
      model,
    };
  } catch (error) {
    console.error("[AI] Hugging Face error:", error);
    throw error;
  }
}

/**
 * Groq API (Ultra-fast, Free Tier)
 * Models: llama-3.1-8b-instant, mixtral-8x7b-32768, gemma-7b-it
 */
export async function chatCompletionGroq(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const apiKey = process.env.GROQ_API_KEY || "";
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 512,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Groq API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return {
      text: text.trim(),
      provider: "groq" as AiProvider,
      model,
    };
  } catch (error) {
    console.error("[AI] Groq error:", error);
    throw error;
  }
}

/**
 * Cohere API (Free Tier)
 * Models: command, command-light, command-r, command-r-plus
 */
export async function chatCompletionCohere(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const apiKey = process.env.COHERE_API_KEY || "";
  const model = process.env.COHERE_MODEL || "command";
  
  if (!apiKey) {
    throw new Error("COHERE_API_KEY not configured");
  }

  try {
    // Format messages for Cohere (combine into single prompt)
    const prompt = formatMessagesForCohere(request.messages);
    
    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 512,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cohere API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.generations?.[0]?.text || "";

    return {
      text: text.trim(),
      provider: "cohere" as AiProvider,
      model,
    };
  } catch (error) {
    console.error("[AI] Cohere error:", error);
    throw error;
  }
}

/**
 * Ollama (Local, Completely Free)
 * Requires Ollama to be running locally or on server
 * Models: llama3, mistral, gemma2, phi3, etc.
 */
export async function chatCompletionOllama(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3";
  
  try {
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        options: {
          temperature: request.temperature || 0.7,
          num_predict: request.maxTokens || 512,
        },
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    const data = await response.json();
    const text = data.message?.content || "";

    return {
      text: text.trim(),
      provider: "ollama" as AiProvider,
      model,
    };
  } catch (error) {
    console.error("[AI] Ollama error:", error);
    throw error;
  }
}

/**
 * Enhanced Gemini Integration (Free Tier)
 * Uses existing Gemini setup but with better error handling
 */
export async function chatCompletionGemini(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || "";
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY not configured");
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Extract system instruction from messages
    const systemMessage = request.messages.find(m => m.role === "system");
    const userMessages = request.messages.filter(m => m.role !== "system");
    
    const genModel = genAI.getGenerativeModel({
      model,
      systemInstruction: systemMessage?.content || request.persona || "You are a helpful assistant.",
    });

    // Convert messages to Gemini format
    const geminiMessages = userMessages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const result = await genModel.generateContent({
      contents: geminiMessages as any,
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxTokens || 512,
      },
    });

    const response = await result.response;
    const text = response.text();

    return {
      text: text.trim(),
      provider: "gemini" as AiProvider,
      model,
    };
  } catch (error) {
    console.error("[AI] Gemini error:", error);
    throw error;
  }
}

/**
 * Helper: Format messages for Hugging Face
 */
function formatMessagesForHF(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
): string {
  let prompt = "";
  for (const msg of messages) {
    if (msg.role === "system") {
      prompt += `System: ${msg.content}\n\n`;
    } else if (msg.role === "user") {
      prompt += `User: ${msg.content}\n\n`;
    } else {
      prompt += `Assistant: ${msg.content}\n\n`;
    }
  }
  prompt += "Assistant:";
  return prompt;
}

/**
 * Helper: Format messages for Cohere
 */
function formatMessagesForCohere(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
): string {
  let prompt = "";
  for (const msg of messages) {
    if (msg.role === "system") {
      prompt += `[System] ${msg.content}\n\n`;
    } else if (msg.role === "user") {
      prompt += `[User] ${msg.content}\n\n`;
    } else {
      prompt += `[Assistant] ${msg.content}\n\n`;
    }
  }
  return prompt.trim();
}

/**
 * Get best free AI provider based on availability
 */
export async function getBestFreeProvider(): Promise<AiProvider> {
  // Priority order: Groq (fastest) > Gemini > Hugging Face > Cohere > Ollama
  const providers = [
    { name: "groq" as AiProvider, check: () => !!process.env.GROQ_API_KEY },
    { name: "gemini" as AiProvider, check: () => !!process.env.GOOGLE_AI_API_KEY },
    { name: "huggingface" as AiProvider, check: () => !!process.env.HUGGINGFACE_API_KEY },
    { name: "cohere" as AiProvider, check: () => !!process.env.COHERE_API_KEY },
    { name: "ollama" as AiProvider, check: () => true }, // Always available if running
  ];

  for (const provider of providers) {
    if (await provider.check()) {
      return provider.name;
    }
  }

  return "mock"; // Fallback
}

