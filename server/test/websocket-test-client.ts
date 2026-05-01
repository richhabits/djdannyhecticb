/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * WebSocket Test Client - Verify real-time chat and reactions
 * Usage: npx tsx server/test/websocket-test-client.ts
 */

import WebSocket from "ws";
import { performance } from "perf_hooks";

// Configuration
const WS_URL = "ws://localhost:3000";
const SESSION_ID = 1;
const TEST_USERS = 3;
const TEST_DURATION_MS = 30000; // 30 seconds
const CONCURRENT_DELAY = 100; // stagger connections by 100ms

interface TestResult {
  userId: number;
  messagesSent: number;
  messagesReceived: number;
  reactionsSent: number;
  reactionsReceived: number;
  errors: string[];
  rateLimitHits: number;
  latencies: number[];
}

class WebSocketTestClient {
  private ws?: WebSocket;
  private result: TestResult;
  private userId: number;
  private isRunning = false;
  private sentMessages: Map<string, number> = new Map(); // messageId -> timestamp

  constructor(userId: number) {
    this.userId = userId;
    this.result = {
      userId,
      messagesSent: 0,
      messagesReceived: 0,
      reactionsSent: 0,
      reactionsReceived: 0,
      errors: [],
      rateLimitHits: 0,
      latencies: [],
    };
  }

  /**
   * Connect to WebSocket
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${WS_URL}?session=${SESSION_ID}&userId=${this.userId}`;
      this.ws = new WebSocket(url);

      this.ws.on("open", () => {
        console.log(`[User ${this.userId}] Connected`);
        this.setupMessageHandlers();
        resolve();
      });

      this.ws.on("error", (error) => {
        console.error(`[User ${this.userId}] Connection error:`, error.message);
        this.result.errors.push(`Connection error: ${error.message}`);
        reject(error);
      });

      this.ws.on("close", () => {
        console.log(`[User ${this.userId}] Disconnected`);
      });

      // Timeout after 5 seconds
      setTimeout(() => reject(new Error("Connection timeout")), 5000);
    });
  }

  /**
   * Setup message handlers
   */
  private setupMessageHandlers(): void {
    if (!this.ws) return;

    this.ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (error) {
        console.error(`[User ${this.userId}] Parse error:`, error);
      }
    });
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: any): void {
    switch (message.type) {
      case "connected":
        console.log(`[User ${this.userId}] Server confirmed connection`);
        break;

      case "chat_message":
        this.result.messagesReceived++;
        const messageId = message.data.id?.toString();
        if (messageId && this.sentMessages.has(messageId)) {
          const latency = Date.now() - this.sentMessages.get(messageId)!;
          this.result.latencies.push(latency);
          this.sentMessages.delete(messageId);
        }
        break;

      case "chat_error":
        console.warn(
          `[User ${this.userId}] Chat error:`,
          message.data.error
        );
        if (message.data.error?.includes("rate limit")) {
          this.result.rateLimitHits++;
        }
        break;

      case "reaction":
        this.result.reactionsReceived++;
        break;

      case "reaction_error":
        console.warn(`[User ${this.userId}] Reaction error:`, message.data.error);
        if (message.data.error?.includes("rate limit")) {
          this.result.rateLimitHits++;
        }
        break;

      case "user_joined":
        console.log(
          `[User ${this.userId}] User joined (active: ${message.data.activeUsers})`
        );
        break;

      case "user_left":
        console.log(
          `[User ${this.userId}] User left (active: ${message.data.activeUsers})`
        );
        break;

      case "pong":
        // Keep-alive response
        break;

      default:
        // Ignore other message types
        break;
    }
  }

  /**
   * Send chat message
   */
  async sendChatMessage(message: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    const timestamp = Date.now();
    const payload = {
      type: "chat",
      data: {
        message,
        color: this.getRandomColor(),
      },
    };

    try {
      this.ws.send(JSON.stringify(payload));
      this.result.messagesSent++;
      this.sentMessages.set(message, timestamp);
    } catch (error) {
      console.error(`[User ${this.userId}] Send error:`, error);
      this.result.errors.push(`Send error: ${error}`);
    }
  }

  /**
   * Send reaction
   */
  async sendReaction(reactionType: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    const payload = {
      type: "reaction",
      data: {
        reactionType,
      },
    };

    try {
      this.ws.send(JSON.stringify(payload));
      this.result.reactionsSent++;
    } catch (error) {
      console.error(`[User ${this.userId}] Send reaction error:`, error);
      this.result.errors.push(`Reaction error: ${error}`);
    }
  }

  /**
   * Send ping
   */
  sendPing(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const payload = { type: "ping", data: {} };
    try {
      this.ws.send(JSON.stringify(payload));
    } catch (error) {
      console.error(`[User ${this.userId}] Ping error:`, error);
    }
  }

  /**
   * Run test sequence
   */
  async runTest(durationMs: number): Promise<void> {
    this.isRunning = true;
    const startTime = performance.now();
    const reactionTypes = ["fire", "love", "hype", "laugh"];

    console.log(
      `[User ${this.userId}] Starting test for ${durationMs}ms...`
    );

    while (this.isRunning && performance.now() - startTime < durationMs) {
      try {
        // Send chat message every 2 seconds
        if (Math.random() > 0.5) {
          await this.sendChatMessage(
            `Message from user ${this.userId} at ${new Date().toISOString().split("T")[1]}`
          );
        }

        // Send reaction every 1 second
        if (Math.random() > 0.3) {
          const reaction =
            reactionTypes[Math.floor(Math.random() * reactionTypes.length)];
          await this.sendReaction(reaction);
        }

        // Send ping every 5 seconds
        if (Math.random() > 0.95) {
          this.sendPing();
        }

        // Wait before next action
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`[User ${this.userId}] Test error:`, error);
        this.result.errors.push(`Test error: ${error}`);
      }
    }

    this.isRunning = false;
    console.log(`[User ${this.userId}] Test completed`);
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }

  /**
   * Get results
   */
  getResult(): TestResult {
    const avgLatency =
      this.result.latencies.length > 0
        ? this.result.latencies.reduce((a, b) => a + b, 0) /
          this.result.latencies.length
        : 0;

    return {
      ...this.result,
      latencies: [avgLatency], // Store only average in output
    };
  }

  /**
   * Get random color
   */
  private getRandomColor(): string {
    const colors = [
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

/**
 * Run test suite
 */
async function runTestSuite(): Promise<void> {
  console.log(
    `Starting WebSocket test with ${TEST_USERS} concurrent users...`
  );
  console.log(`Duration: ${TEST_DURATION_MS}ms`);
  console.log(`Server: ${WS_URL}`);
  console.log("---");

  const clients: WebSocketTestClient[] = [];
  const results: TestResult[] = [];

  try {
    // Connect all clients
    for (let i = 1; i <= TEST_USERS; i++) {
      const client = new WebSocketTestClient(i);
      try {
        await client.connect();
        clients.push(client);

        // Stagger connections
        if (i < TEST_USERS) {
          await new Promise((resolve) => setTimeout(resolve, CONCURRENT_DELAY));
        }
      } catch (error) {
        console.error(`Failed to connect user ${i}:`, error);
      }
    }

    console.log(`Connected ${clients.length} clients`);
    console.log("---");

    // Run tests concurrently
    const testPromises = clients.map((client) =>
      client.runTest(TEST_DURATION_MS)
    );
    await Promise.all(testPromises);

    // Collect results
    clients.forEach((client) => {
      results.push(client.getResult());
      client.disconnect();
    });

    // Print results
    console.log("\n=== Test Results ===\n");

    const totalMessagesSent = results.reduce((sum, r) => sum + r.messagesSent, 0);
    const totalMessagesReceived = results.reduce((sum, r) => sum + r.messagesReceived, 0);
    const totalReactionsSent = results.reduce((sum, r) => sum + r.reactionsSent, 0);
    const totalReactionsReceived = results.reduce((sum, r) => sum + r.reactionsReceived, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalRateLimits = results.reduce((sum, r) => sum + r.rateLimitHits, 0);

    console.log("Overall Statistics:");
    console.log(`  Total Messages Sent: ${totalMessagesSent}`);
    console.log(`  Total Messages Received: ${totalMessagesReceived}`);
    console.log(`  Message Delivery Rate: ${((totalMessagesReceived / totalMessagesSent) * 100).toFixed(1)}%`);
    console.log(`  Total Reactions Sent: ${totalReactionsSent}`);
    console.log(`  Total Reactions Received: ${totalReactionsReceived}`);
    console.log(`  Total Errors: ${totalErrors}`);
    console.log(`  Total Rate Limit Hits: ${totalRateLimits}`);

    console.log("\nPer-User Statistics:");
    results.forEach((result) => {
      const deliveryRate = result.messagesSent > 0
        ? ((result.messagesReceived / (result.messagesSent * TEST_USERS)) * 100).toFixed(1)
        : "N/A";
      console.log(`  User ${result.userId}:`);
      console.log(`    Messages Sent: ${result.messagesSent}`);
      console.log(`    Messages Received: ${result.messagesReceived}`);
      console.log(`    Reactions Sent: ${result.reactionsSent}`);
      console.log(`    Avg Latency: ${result.latencies[0]?.toFixed(0)}ms`);
      console.log(`    Errors: ${result.errors.length}`);
      console.log(`    Rate Limits: ${result.rateLimitHits}`);
    });

    if (totalErrors > 0) {
      console.log("\nErrors encountered:");
      const allErrors = new Set<string>();
      results.forEach((r) => r.errors.forEach((e) => allErrors.add(e)));
      allErrors.forEach((e) => console.log(`  - ${e}`));
    }
  } catch (error) {
    console.error("Test suite error:", error);
  }
}

// Run the test
runTestSuite().catch(console.error);
