/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { conversations, directMessages } from "../../drizzle/engagement-schema";
import { eq, or, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const messageSchema = z.object({
  recipientId: z.number(),
  content: z.string().min(1).max(5000),
  imageUrl: z.string().url().optional(),
});

export const messagesRouter = router({
  // Send a direct message
  sendMessage: protectedProcedure
    .input(messageSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      if (userId === input.recipientId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot message yourself" });
      }

      // Find or create conversation
      const [existing] = await ctx.db
        .select()
        .from(conversations)
        .where(
          or(
            and(
              eq(conversations.user1Id, userId),
              eq(conversations.user2Id, input.recipientId)
            ),
            and(
              eq(conversations.user1Id, input.recipientId),
              eq(conversations.user2Id, userId)
            )
          )
        )
        .limit(1);

      let conversationId: number;

      if (existing) {
        conversationId = existing.id;
        // Update last message time
        await ctx.db
          .update(conversations)
          .set({ lastMessageAt: new Date() })
          .where(eq(conversations.id, conversationId));
      } else {
        // Create new conversation
        const [conversation] = await db
          .insert(conversations)
          .values({
            user1Id: Math.min(userId, input.recipientId),
            user2Id: Math.max(userId, input.recipientId),
            lastMessageAt: new Date(),
          })
          .returning();

        conversationId = conversation!.id;
      }

      // Insert message
      const [message] = await ctx.db
        .insert(directMessages)
        .values({
          conversationId,
          senderId: userId,
          content: input.content,
          imageUrl: input.imageUrl,
        })
        .returning();

      return message;
    }),

  // Get messages in a conversation
  getMessages: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Verify user is part of conversation
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId))
        .limit(1);

      if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't have access to this conversation" });
      }

      const messages = await db
        .select()
        .from(directMessages)
        .where(eq(directMessages.conversationId, input.conversationId))
        .orderBy(desc(directMessages.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return messages.reverse(); // Return in chronological order
    }),

  // Mark messages as read
  markAsRead: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Verify user is part of conversation
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId))
        .limit(1);

      if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't have access to this conversation" });
      }

      // Mark all unread messages from other user as read
      const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;

      await db
        .update(directMessages)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(directMessages.conversationId, input.conversationId),
            eq(directMessages.senderId, otherUserId),
            eq(directMessages.readAt, null)
          )
        );

      return { success: true };
    }),

  // Delete a message
  deleteMessage: protectedProcedure
    .input(z.object({
      messageId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Verify ownership
      const [message] = await ctx.db
        .select()
        .from(directMessages)
        .where(eq(directMessages.id, input.messageId))
        .limit(1);

      if (!message || message.senderId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete this message" });
      }

      // Soft delete
      await db
        .update(directMessages)
        .set({ deletedAt: new Date() })
        .where(eq(directMessages.id, input.messageId));

      return { success: true };
    }),

  // Get all conversations for user
  getConversations: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const userConversations = await db
        .select()
        .from(conversations)
        .where(
          or(
            eq(conversations.user1Id, userId),
            eq(conversations.user2Id, userId)
          )
        )
        .orderBy(desc(conversations.lastMessageAt))
        .limit(input.limit)
        .offset(input.offset);

      return userConversations;
    }),

  // Get unread message count for a conversation
  getUnreadCount: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Verify user is part of conversation
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId))
        .limit(1);

      if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't have access to this conversation" });
      }

      const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;

      const unreadMessages = await db
        .select()
        .from(directMessages)
        .where(
          and(
            eq(directMessages.conversationId, input.conversationId),
            eq(directMessages.senderId, otherUserId),
            eq(directMessages.readAt, null)
          )
        );

      return { unreadCount: unreadMessages.length };
    }),

  // Get conversation with specific user
  getConversationWithUser: protectedProcedure
    .input(z.object({
      otherUserId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [conversation] = await db
        .select()
        .from(conversations)
        .where(
          or(
            and(
              eq(conversations.user1Id, userId),
              eq(conversations.user2Id, input.otherUserId)
            ),
            and(
              eq(conversations.user1Id, input.otherUserId),
              eq(conversations.user2Id, userId)
            )
          )
        )
        .limit(1);

      return conversation || null;
    }),
});
