/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import Anthropic from "@anthropic-ai/sdk";
import { MessageParam } from "@anthropic-ai/sdk/resources/messages.mjs";

const RATE_LIMITS = {
  requestsPerMinute: 60,
  tokensPerMinute: 1_000_000, // 1M tokens/min tier
  maxRetries: 3,
  backoffMs: 1000,
  maxBackoffMs: 30_000,
};

/**
 * Token Bucket Rate Limiter
 * Prevents exceeding rate limits by tracking tokens over time
 */
class TokenBucket {
  private tokens: number;
  private lastRefillTime: number;
  private refillRate: number; // tokens per ms

  constructor(tokensPerMinute: number) {
    this.tokens = tokensPerMinute;
    this.lastRefillTime = Date.now();
    this.refillRate = tokensPerMinute / (60 * 1000); // Convert to tokens/ms
  }

  /**
   * Acquire tokens from bucket. Returns false if not enough tokens available.
   */
  async acquire(tokensNeeded: number): Promise<void> {
    while (!this.canAcquire(tokensNeeded)) {
      const refillTime = Math.ceil(
        (tokensNeeded - this.tokens) / this.refillRate
      );
      await new Promise((resolve) => setTimeout(resolve, Math.min(refillTime, 100)));
      this.refill();
    }

    this.refill();
    this.tokens -= tokensNeeded;
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefillTime;
    this.tokens = Math.min(
      RATE_LIMITS.tokensPerMinute,
      this.tokens + timePassed * this.refillRate
    );
    this.lastRefillTime = now;
  }

  private canAcquire(tokensNeeded: number): boolean {
    this.refill();
    return this.tokens >= tokensNeeded;
  }
}

/**
 * Estimate tokens in a message (rough approximation)
 * In production, use Anthropic's token counter
 */
function estimateTokens(messages: MessageParam[]): number {
  let totalChars = 0;
  for (const msg of messages) {
    if (typeof msg.content === "string") {
      totalChars += msg.content.length;
    } else if (Array.isArray(msg.content)) {
      for (const block of msg.content) {
        if (block.type === "text") {
          totalChars += block.text.length;
        }
      }
    }
  }

  // Rough estimate: ~4 chars per token
  return Math.ceil(totalChars / 4);
}

/**
 * Check if error is retryable (rate limit or temporary)
 */
function isRetryableError(error: any): boolean {
  if (error.status === 429 || error.status === 500 || error.status === 503) {
    return true;
  }
  return error.message?.includes("timeout") || false;
}

/**
 * Rate-limited Claude API client
 * Automatically handles queuing and backoff
 */
export class RateLimitedClaudeClient {
  private client: Anthropic;
  private queue: Promise<any> = Promise.resolve();
  private tokenBucket: TokenBucket;
  private requestCount = 0;
  private requestCountResetTime = Date.now();

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
    this.tokenBucket = new TokenBucket(RATE_LIMITS.tokensPerMinute);
  }

  /**
   * Call Claude API with automatic rate limiting and retries
   */
  async call(
    messages: MessageParam[],
    systemPrompt?: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
    }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.queue = this.queue
        .then(async () => {
          const tokensEstimate = estimateTokens(messages);
          await this.tokenBucket.acquire(tokensEstimate);
          await this.checkRequestLimit();
          return this.callWithRetry(messages, systemPrompt, options);
        })
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Internal: Call with automatic retry on failure
   */
  private async callWithRetry(
    messages: MessageParam[],
    systemPrompt?: string,
    options?: any,
    attempt = 0
  ): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: options?.model || "claude-3-5-sonnet-20241022",
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature || 0.7,
        system: systemPrompt,
        messages,
      });

      this.recordRequest();

      const content = response.content[0];
      if (content.type === "text") {
        return content.text;
      }

      throw new Error("Unexpected response format from Claude API");
    } catch (error) {
      if (
        attempt < RATE_LIMITS.maxRetries &&
        isRetryableError(error)
      ) {
        const backoff = Math.min(
          RATE_LIMITS.backoffMs * Math.pow(2, attempt),
          RATE_LIMITS.maxBackoffMs
        );

        console.warn(
          `[Claude API] Retrying after ${backoff}ms (attempt ${attempt + 1}/${RATE_LIMITS.maxRetries})`
        );

        await new Promise((resolve) => setTimeout(resolve, backoff));
        return this.callWithRetry(messages, systemPrompt, options, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Check if we're under the requests per minute limit
   */
  private async checkRequestLimit(): Promise<void> {
    const now = Date.now();
    const timePassed = now - this.requestCountResetTime;

    // Reset counter every minute
    if (timePassed > 60_000) {
      this.requestCount = 0;
      this.requestCountResetTime = now;
    }

    // If we're at the limit, wait
    if (this.requestCount >= RATE_LIMITS.requestsPerMinute) {
      const waitTime = 60_000 - timePassed;
      console.warn(
        `[Claude API] Rate limit reached. Waiting ${waitTime}ms before next request.`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.requestCountResetTime = Date.now();
    }
  }

  /**
   * Record a successful request
   */
  private recordRequest(): void {
    this.requestCount++;
  }

  /**
   * Get current rate limit status
   */
  getStatus(): {
    requestsUsed: number;
    requestsLimit: number;
    tokenBucketTokens: number;
  } {
    return {
      requestsUsed: this.requestCount,
      requestsLimit: RATE_LIMITS.requestsPerMinute,
      tokenBucketTokens: RATE_LIMITS.tokensPerMinute,
    };
  }
}

/**
 * Singleton instance
 */
let _client: RateLimitedClaudeClient | null = null;

export function getClaudeClient(): RateLimitedClaudeClient {
  if (!_client) {
    _client = new RateLimitedClaudeClient();
  }
  return _client;
}
