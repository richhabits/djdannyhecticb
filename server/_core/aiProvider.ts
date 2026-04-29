/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { CohereClient } from "cohere-ai";

export type AIProvider = "gemini" | "groq" | "cohere" | "huggingface" | "ollama" | "auto";

interface AIResponse {
  success: boolean;
  text?: string;
  provider: AIProvider;
  model: string;
  error?: string;
}

class AIProviderManager {
  private geminiKey = process.env.GOOGLE_AI_API_KEY || "";
  private geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  private groqKey = process.env.GROQ_API_KEY || "";
  private groqModel = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  private cohereKey = process.env.COHERE_API_KEY || "";
  private cohereModel = process.env.COHERE_MODEL || "command";

  private huggingFaceKey = process.env.HUGGINGFACE_API_KEY || "";
  private huggingFaceModel = process.env.HUGGINGFACE_MODEL || "meta-llama/Llama-3.1-8B-Instruct";

  private ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  private ollamaModel = process.env.OLLAMA_MODEL || "llama3";

  private systemPrompt = `
You are Danny Hectic (DJ Danny Hectic B), a legendary UK Garage and House DJ with 30+ years in the game.
You are chatting with a fan on your website.

Style:
- Energetic, positive, London slang but readable.
- Use words like: "Safe", "Nice one", "Locked in", "Vibes", "Geezer", "Proper".
- Emojis: 🎧, 🔥, 🚀, 👊, 🔊.
- You are a musical encyclopedia of UK Garage, House, Jungle, and Grime.
- Always check if they are "locked in" to the radio.

Context:
- You are currently "Live in the Studio" (or mock it if you don't know).
- Mention "Hectic Radio" often.
- If asked about bookings: Send them to /bookings. IMPORTANT: Mention you have a Clean DBS check and valid USA Visa for travel.
- If asked about mixes, send them to /mixes.

Keep responses short, punchy, and mobile-friendly.
`;

  async chat(message: string, provider: AIProvider = "auto"): Promise<AIResponse> {
    // Auto-detect best available provider
    if (provider === "auto") {
      if (this.geminiKey) provider = "gemini";
      else if (this.groqKey) provider = "groq";
      else if (this.cohereKey) provider = "cohere";
      else if (this.huggingFaceKey) provider = "huggingface";
      else provider = "ollama"; // Ollama is local, always available
    }

    try {
      switch (provider) {
        case "gemini":
          return await this.chatWithGemini(message);
        case "groq":
          return await this.chatWithGroq(message);
        case "cohere":
          return await this.chatWithCohere(message);
        case "huggingface":
          return await this.chatWithHuggingFace(message);
        case "ollama":
          return await this.chatWithOllama(message);
        default:
          return {
            success: false,
            provider: "auto",
            model: "unknown",
            error: `Unknown provider: ${provider}`,
          };
      }
    } catch (error) {
      console.error(`AI Provider Error (${provider}):`, error);
      return {
        success: false,
        provider,
        model: this.getModelForProvider(provider),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async chatWithGemini(message: string): Promise<AIResponse> {
    if (!this.geminiKey) {
      return {
        success: false,
        provider: "gemini",
        model: this.geminiModel,
        error: "Gemini API key not configured",
      };
    }

    const genAI = new GoogleGenerativeAI(this.geminiKey);
    const model = genAI.getGenerativeModel({
      model: this.geminiModel,
      systemInstruction: this.systemPrompt,
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      text,
      provider: "gemini",
      model: this.geminiModel,
    };
  }

  private async chatWithGroq(message: string): Promise<AIResponse> {
    if (!this.groqKey) {
      return {
        success: false,
        provider: "groq",
        model: this.groqModel,
        error: "Groq API key not configured",
      };
    }

    const groq = new Groq({ apiKey: this.groqKey });
    const response = await groq.chat.completions.create({
      model: this.groqModel,
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 1024,
    });

    const text = response.choices[0]?.message?.content || "No response";

    return {
      success: true,
      text,
      provider: "groq",
      model: this.groqModel,
    };
  }

  private async chatWithCohere(message: string): Promise<AIResponse> {
    if (!this.cohereKey) {
      return {
        success: false,
        provider: "cohere",
        model: this.cohereModel,
        error: "Cohere API key not configured",
      };
    }

    const cohere = new CohereClient({ token: this.cohereKey });
    const response = await cohere.chat({
      model: this.cohereModel,
      message,
      preamble: this.systemPrompt,
    });

    const text = response.text || "No response";

    return {
      success: true,
      text,
      provider: "cohere",
      model: this.cohereModel,
    };
  }

  private async chatWithHuggingFace(message: string): Promise<AIResponse> {
    if (!this.huggingFaceKey) {
      return {
        success: false,
        provider: "huggingface",
        model: this.huggingFaceModel,
        error: "Hugging Face API key not configured",
      };
    }

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${this.huggingFaceModel}`,
      {
        headers: { Authorization: `Bearer ${this.huggingFaceKey}` },
        method: "POST",
        body: JSON.stringify({
          inputs: `[SYSTEM] ${this.systemPrompt}\n[USER] ${message}`,
        }),
      }
    );

    const result = (await response.json()) as any[];
    const text = result[0]?.generated_text || "No response";

    return {
      success: true,
      text,
      provider: "huggingface",
      model: this.huggingFaceModel,
    };
  }

  private async chatWithOllama(message: string): Promise<AIResponse> {
    const response = await fetch(`${this.ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.ollamaModel,
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: message },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        provider: "ollama",
        model: this.ollamaModel,
        error: `Ollama error: ${response.statusText}`,
      };
    }

    const result = (await response.json()) as any;
    const text = result.message?.content || "No response";

    return {
      success: true,
      text,
      provider: "ollama",
      model: this.ollamaModel,
    };
  }

  private getModelForProvider(provider: AIProvider): string {
    switch (provider) {
      case "gemini":
        return this.geminiModel;
      case "groq":
        return this.groqModel;
      case "cohere":
        return this.cohereModel;
      case "huggingface":
        return this.huggingFaceModel;
      case "ollama":
        return this.ollamaModel;
      default:
        return "unknown";
    }
  }

  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];
    if (this.geminiKey) providers.push("gemini");
    if (this.groqKey) providers.push("groq");
    if (this.cohereKey) providers.push("cohere");
    if (this.huggingFaceKey) providers.push("huggingface");
    providers.push("ollama"); // Always available locally
    return providers;
  }
}

export const aiProvider = new AIProviderManager();
