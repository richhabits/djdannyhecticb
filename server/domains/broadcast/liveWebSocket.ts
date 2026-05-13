/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * WebSocket Handler for Real-time Live Features
 * Handles real-time chat, reactions, and notifications
 */

import WebSocket, { WebSocketServer } from "ws";
import { getDb } from "../db";
import { chatMessages, notifications } from "../../drizzle/engagement-schema";
import { eq, and } from "drizzle-orm";
import { handleChatMessage, isUserRateLimited as isChatRateLimited, initializeChatLimiter } from "../features/liveChat";
import { handleReaction, isUserReactionLimited as isReactionRateLimited, initializeReactionLimiter } from "../features/reactions";

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

// Initialize limiters on module load
initializeChatLimiter();
initializeReactionLimiter();

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

    // Announce user join to session
    broadcastToSession(session.liveSessionId, {
      type: "user_joined",
      data: {
        userId: session.userId,
        username: session.username,
        activeUsers: getSessionConnectionCount(session.liveSessionId),
      },
    });

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

      // Announce user left to session
      broadcastToSession(session.liveSessionId, {
        type: "user_left",
        data: {
          userId: session.userId,
          activeUsers: getSessionConnectionCount(session.liveSessionId),
        },
      });
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
        sessionId: session.liveSessionId,
        userId: session.userId,
        activeUsers: getSessionConnectionCount(session.liveSessionId),
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
        await handleChatMessageEvent(message.data, session);
        break;

      case "reaction":
        await handleReactionEvent(message.data, session);
        break;

      case "ping":
        // Keep-alive ping - respond with pong
        broadcastToSession(session.liveSessionId, {
          type: "pong",
          data: { timestamp: Date.now() },
        });
        break;

      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  } catch (error) {
    console.error("Message handling error:", error);
  }
}

/**
 * Handle chat message event with proper error response
 */
async function handleChatMessageEvent(
  data: { message: string; color?: string },
  session: LiveSession
) {
  const result = await handleChatMessage(data, session.userId, session.liveSessionId);

  if (!result.success) {
    // Send error to sender only
    const connectionId = `${session.liveSessionId}:${session.userId}`;
    const senderWs = sessions.get(connectionId)?.ws;
    if (senderWs && senderWs.readyState === WebSocket.OPEN) {
      senderWs.send(
        JSON.stringify({
          type: "chat_error",
          data: { error: result.error },
        })
      );
    }
    return;
  }

  // Broadcast successful message to all in session
  broadcastToSession(session.liveSessionId, {
    type: "chat_message",
    data: result.message,
  });
}

/**
 * Handle reaction event with combo feedback
 */
async function handleReactionEvent(
  data: { reactionType: string },
  session: LiveSession
) {
  const result = await handleReaction(
    { reactionType: data.reactionType as any },
    session.userId,
    session.liveSessionId
  );

  if (!result.success) {
    // Send error to sender only
    const connectionId = `${session.liveSessionId}:${session.userId}`;
    const senderWs = sessions.get(connectionId)?.ws;
    if (senderWs && senderWs.readyState === WebSocket.OPEN) {
      senderWs.send(
        JSON.stringify({
          type: "reaction_error",
          data: { error: result.error },
        })
      );
    }
    return;
  }

  // Broadcast reaction to all in session
  broadcastToSession(session.liveSessionId, {
    type: "reaction",
    data: {
      userId: session.userId,
      reactionType: data.reactionType,
      timestamp: new Date(),
      combo: result.combo,
      reaction: result.reaction,
    },
  });
}


/**
 * Broadcast to all clients in a session
 */
function broadcastToSession(liveSessionId: number, message: Message) {
  const payload = JSON.stringify(message);
  let broadcastCount = 0;

  sessions.forEach(({ ws, session }) => {
    if (session.liveSessionId === liveSessionId && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(payload);
        broadcastCount++;
      } catch (error) {
        console.error(`[WebSocket] Failed to send message to user ${session.userId}:`, error);
      }
    }
  });

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[WebSocket] Broadcast to ${broadcastCount} users in session ${liveSessionId}`
    );
  }
}

/**
 * Broadcast to specific user(s)
 */
function broadcastToUser(
  userId: number,
  liveSessionId: number,
  message: Message
) {
  const payload = JSON.stringify(message);
  const connectionId = `${liveSessionId}:${userId}`;
  const connection = sessions.get(connectionId);

  if (connection && connection.ws.readyState === WebSocket.OPEN) {
    try {
      connection.ws.send(payload);
    } catch (error) {
      console.error(
        `[WebSocket] Failed to send message to user ${userId}:`,
        error
      );
    }
  }
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
    broadcastToUser(userId, liveSessionId, message);
  } else {
    // Broadcast to all in session
    broadcastToSession(liveSessionId, message);
  }
}

/**
 * Broadcast donation event
 */
export function broadcastDonation(
  liveSessionId: number,
  donation: {
    userId: number;
    amount: number;
    currency: string;
    message?: string;
    anonymous?: boolean;
  }
) {
  broadcastToSession(liveSessionId, {
    type: "notification",
    data: {
      type: "donation",
      title: "New Donation!",
      message: donation.message || `${donation.amount} ${donation.currency} donation`,
      metadata: donation,
      timestamp: new Date(),
    },
  });
}

/**
 * Broadcast subscriber event
 */
export function broadcastSubscriber(
  liveSessionId: number,
  subscriber: {
    userId: number;
    username: string;
    tier: string;
  }
) {
  broadcastToSession(liveSessionId, {
    type: "notification",
    data: {
      type: "subscriber",
      title: "New Subscriber!",
      message: `${subscriber.username} subscribed at ${subscriber.tier} tier!`,
      metadata: subscriber,
      timestamp: new Date(),
    },
  });
}

/**
 * Broadcast follower event
 */
export function broadcastFollower(
  liveSessionId: number,
  follower: {
    userId: number;
    username: string;
  }
) {
  broadcastToSession(liveSessionId, {
    type: "notification",
    data: {
      type: "follower",
      title: "New Follower!",
      message: `${follower.username} followed!`,
      metadata: follower,
      timestamp: new Date(),
    },
  });
}

/**
 * Broadcast admin action
 */
export function broadcastAdminAction(
  liveSessionId: number,
  action: {
    type: "message_deleted" | "message_pinned" | "user_muted" | "user_banned";
    targetId: number;
    reason?: string;
  }
) {
  const actionTitles: Record<string, string> = {
    message_deleted: "Message Deleted",
    message_pinned: "Message Pinned",
    user_muted: "User Muted",
    user_banned: "User Banned",
  };

  broadcastToSession(liveSessionId, {
    type: "notification",
    data: {
      type: "admin_action",
      title: actionTitles[action.type],
      message: `Admin action: ${action.type}`,
      metadata: action,
      timestamp: new Date(),
    },
  });
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

/**
 * Setup WebSocket server for live chat
 * Call this in the main server setup
 */
export function setupLiveWebSocket(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request: any, socket: any, head: any) => {
    if (request.url?.startsWith("/ws/live")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        initializeLiveWebSocket(wss);
      });
    }
  });

  console.log("[WebSocket] Live chat WebSocket server initialized");
}
