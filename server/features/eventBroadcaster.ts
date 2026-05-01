/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Event Broadcaster - Centralized event emission for WebSocket clients
 */

import WebSocket from "ws";

interface BroadcastEvent {
  type: string;
  data: any;
  timestamp: number;
}

interface EventHandler {
  (event: BroadcastEvent): void;
}

class EventBroadcaster {
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private eventQueue: BroadcastEvent[] = [];
  private maxQueueSize = 1000;
  private processingQueue = false;

  /**
   * Subscribe to event type
   */
  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }

    this.eventHandlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Emit event to all subscribers
   */
  emit(eventType: string, data: any): void {
    const event: BroadcastEvent = {
      type: eventType,
      data,
      timestamp: Date.now(),
    };

    // Queue event for processing
    if (this.eventQueue.length < this.maxQueueSize) {
      this.eventQueue.push(event);
    } else {
      console.warn(
        "[EventBroadcaster] Event queue is full, dropping event:",
        eventType
      );
    }

    // Process queue if not already processing
    if (!this.processingQueue) {
      this.processQueue();
    }
  }

  /**
   * Process event queue
   */
  private processQueue(): void {
    if (this.processingQueue || this.eventQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!;
        const handlers = this.eventHandlers.get(event.type);

        if (handlers) {
          handlers.forEach((handler) => {
            try {
              handler(event);
            } catch (error) {
              console.error(
                `[EventBroadcaster] Error in handler for ${event.type}:`,
                error
              );
            }
          });
        }
      }
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Get stats about the broadcaster
   */
  getStats() {
    return {
      queueLength: this.eventQueue.length,
      subscriberCount: this.eventHandlers.size,
      handlerCounts: Array.from(this.eventHandlers.entries()).map(
        ([type, handlers]) => ({
          type,
          count: handlers.size,
        })
      ),
    };
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.eventHandlers.clear();
    this.eventQueue = [];
  }
}

// Global broadcaster instance
const broadcaster = new EventBroadcaster();

export default broadcaster;

/**
 * Event types for chat and reactions
 */
export const eventTypes = {
  CHAT_MESSAGE: "chat:message",
  CHAT_MESSAGE_DELETED: "chat:message_deleted",
  CHAT_MESSAGE_PINNED: "chat:message_pinned",
  REACTION_ADDED: "reaction:added",
  REACTION_COMBO: "reaction:combo",
  USER_JOINED: "user:joined",
  USER_LEFT: "user:left",
  DONATION: "donation:received",
  SUBSCRIBER: "subscriber:new",
  FOLLOWER: "follower:new",
  POLL_CREATED: "poll:created",
  POLL_UPDATED: "poll:updated",
  POLL_CLOSED: "poll:closed",
  NOTIFICATION: "notification:general",
  ADMIN_ACTION: "admin:action",
};

/**
 * Helper functions to emit events
 */

export function emitChatMessage(
  liveSessionId: number,
  message: any
): void {
  broadcaster.emit(eventTypes.CHAT_MESSAGE, {
    liveSessionId,
    message,
  });
}

export function emitChatDeleted(
  liveSessionId: number,
  messageId: number,
  reason?: string
): void {
  broadcaster.emit(eventTypes.CHAT_MESSAGE_DELETED, {
    liveSessionId,
    messageId,
    reason,
  });
}

export function emitChatPinned(
  liveSessionId: number,
  messageId: number
): void {
  broadcaster.emit(eventTypes.CHAT_MESSAGE_PINNED, {
    liveSessionId,
    messageId,
  });
}

export function emitReaction(
  liveSessionId: number,
  userId: number,
  reactionType: string,
  combo?: { isCombo: boolean; streakCount: number }
): void {
  broadcaster.emit(eventTypes.REACTION_ADDED, {
    liveSessionId,
    userId,
    reactionType,
    combo,
  });
}

export function emitReactionCombo(
  liveSessionId: number,
  userId: number,
  reactionType: string,
  streakCount: number
): void {
  broadcaster.emit(eventTypes.REACTION_COMBO, {
    liveSessionId,
    userId,
    reactionType,
    streakCount,
  });
}

export function emitUserJoined(
  liveSessionId: number,
  userId: number,
  username: string,
  activeUsers: number
): void {
  broadcaster.emit(eventTypes.USER_JOINED, {
    liveSessionId,
    userId,
    username,
    activeUsers,
  });
}

export function emitUserLeft(
  liveSessionId: number,
  userId: number,
  activeUsers: number
): void {
  broadcaster.emit(eventTypes.USER_LEFT, {
    liveSessionId,
    userId,
    activeUsers,
  });
}

export function emitDonation(
  liveSessionId: number,
  donation: any
): void {
  broadcaster.emit(eventTypes.DONATION, {
    liveSessionId,
    donation,
  });
}

export function emitSubscriber(
  liveSessionId: number,
  subscriber: any
): void {
  broadcaster.emit(eventTypes.SUBSCRIBER, {
    liveSessionId,
    subscriber,
  });
}

export function emitFollower(
  liveSessionId: number,
  follower: any
): void {
  broadcaster.emit(eventTypes.FOLLOWER, {
    liveSessionId,
    follower,
  });
}

export function emitPollCreated(
  liveSessionId: number,
  poll: any
): void {
  broadcaster.emit(eventTypes.POLL_CREATED, {
    liveSessionId,
    poll,
  });
}

export function emitPollUpdated(
  liveSessionId: number,
  pollId: number,
  votes: Record<number, number>
): void {
  broadcaster.emit(eventTypes.POLL_UPDATED, {
    liveSessionId,
    pollId,
    votes,
  });
}

export function emitPollClosed(
  liveSessionId: number,
  pollId: number,
  results: any
): void {
  broadcaster.emit(eventTypes.POLL_CLOSED, {
    liveSessionId,
    pollId,
    results,
  });
}

export function emitNotification(
  liveSessionId: number,
  notification: {
    type: string;
    title: string;
    message: string;
    metadata?: any;
  },
  userId?: number
): void {
  broadcaster.emit(eventTypes.NOTIFICATION, {
    liveSessionId,
    userId,
    notification,
  });
}

export function emitAdminAction(
  liveSessionId: number,
  action: {
    type: string;
    targetId: number;
    reason?: string;
  }
): void {
  broadcaster.emit(eventTypes.ADMIN_ACTION, {
    liveSessionId,
    action,
  });
}
