/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * WebSocket Handler for Real-time Live Features
 * Handles real-time chat, reactions, and notifications
 */

import WebSocket from "ws";
import { getDb } from "../db";
import { chatMessages, notifications } from "../../drizzle/engagement-schema";
import { eq, and } from "drizzle-orm";

interface LiveSession {
  liveSessionId: number;
  userId: number;
  username: string;
}

interface Message {
  type:
    | "chat"
    | "reaction"
    | "notification"
    | "poll_update"
    | "subscribe"
    | "unsubscribe"
    | "ping";
  data: any;
}

// Track active WebSocket connections
const sessions = new Map<string, { ws: WebSocket; session: LiveSession }>();

/**
 * Initialize WebSocket handler
 */
export function initializeLiveWebSocket(wss: WebSocket.Server) {
  wss.on("connection", (ws: WebSocket, req) => {
    const sessionId = req.url?.split("session=")[1];
    const userId = req.url?.split("userId=")[1];

    if (!sessionId || !userId) {
      ws.close(1008, "Missing required parameters");
      return;
    }

    // Register session
    const connectionId = `${sessionId}:${userId}`;
    const session: LiveSession = {
      liveSessionId: parseInt(sessionId),
      userId: parseInt(userId),
      username: "User",
    };

    sessions.set(connectionId, { ws, session });

    console.log(`[WebSocket] User ${userId} connected to session ${sessionId}`);

    // Handle incoming messages
    ws.on("message", (data) => {
      handleMessage(data.toString(), session);
    });

    // Handle disconnect
    ws.on("close", () => {
      sessions.delete(connectionId);
      console.log(
        `[WebSocket] User ${userId} disconnected from session ${sessionId}`
      );
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error(`[WebSocket] Error:`, error);
    });

    // Acknowledge connection
    ws.send(
      JSON.stringify({
        type: "connected",
        message: "Connected to live session",
      })
    );
  });
}

/**
 * Handle incoming message
 */
async function handleMessage(rawData: string, session: LiveSession) {
  try {
    const message: Message = JSON.parse(rawData);

    switch (message.type) {
      case "chat":
        await handleChatMessage(message.data, session);
        break;

      case "reaction":
        await handleReaction(message.data, session);
        break;

      case "ping":
        // Keep-alive ping
        break;

      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  } catch (error) {
    console.error("Message handling error:", error);
  }
}

/**
 * Handle chat message
 */
async function handleChatMessage(
  data: { message: string; color?: string },
  session: LiveSession
) {
  const db = await getDb();
  if (!db) return;

  try {
    // Save message to database
    const msg = await db
      .insert(chatMessages)
      .values({
        liveSessionId: session.liveSessionId,
        userId: session.userId,
        message: data.message,
        usernameColor: data.color || "#ffffff",
      })
      .returning();

    // Broadcast to all connected clients in this session
    broadcastToSession(session.liveSessionId, {
      type: "chat_message",
      data: msg[0],
    });
  } catch (error) {
    console.error("Chat message error:", error);
  }
}

/**
 * Handle reaction
 */
async function handleReaction(
  data: { type: string },
  session: LiveSession
) {
  // Broadcast reaction to all connected clients
  broadcastToSession(session.liveSessionId, {
    type: "reaction",
    data: {
      userId: session.userId,
      reactionType: data.type,
      timestamp: new Date(),
    },
  });
}

/**
 * Broadcast to all clients in a session
 */
function broadcastToSession(liveSessionId: number, message: Message) {
  const payload = JSON.stringify(message);

  sessions.forEach(({ ws, session }) => {
    if (session.liveSessionId === liveSessionId && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

/**
 * Broadcast notification to specific user or all in session
 */
export async function broadcastNotification(
  liveSessionId: number,
  notification: {
    type: string;
    title: string;
    message: string;
    metadata?: any;
  },
  userId?: number
) {
  const message: Message = {
    type: "notification",
    data: {
      ...notification,
      timestamp: new Date(),
    },
  };

  if (userId) {
    // Send to specific user
    const connectionId = Array.from(sessions.entries()).find(
      ([key, val]) =>
        val.session.userId === userId &&
        val.session.liveSessionId === liveSessionId
    )?.[0];

    if (connectionId) {
      const { ws } = sessions.get(connectionId)!;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  } else {
    // Broadcast to all in session
    broadcastToSession(liveSessionId, message);
  }
}

/**
 * Get active connection count for a session
 */
export function getSessionConnectionCount(liveSessionId: number): number {
  let count = 0;
  sessions.forEach(({ session }) => {
    if (session.liveSessionId === liveSessionId) {
      count++;
    }
  });
  return count;
}

/**
 * Close all connections for a session
 */
export function closeSessionConnections(liveSessionId: number) {
  sessions.forEach(({ ws, session }, connectionId) => {
    if (session.liveSessionId === liveSessionId) {
      ws.close(1000, "Session ended");
      sessions.delete(connectionId);
    }
  });
}
