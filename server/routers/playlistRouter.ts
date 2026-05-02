/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Playlist Router - Clip collections and curation
 */

import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { eq, desc, and, count, isNull } from "drizzle-orm";
import {
  playlists,
  playlistItems,
  playlistFollowers,
  clips,
  InsertPlaylist,
  InsertPlaylistItem,
  InsertPlaylistFollower,
} from "../../drizzle/content-schema";
import { users } from "../../drizzle/schema";
import { nanoid } from "nanoid";

// ==========================================
// INPUT VALIDATORS
// ==========================================
const CreatePlaylistInput = z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(1000).optional(),
  coverImageUrl: z.string().url().optional(),
});

const UpdatePlaylistInput = z.object({
  playlistId: z.string(),
  title: z.string().min(3).max(255).optional(),
  description: z.string().max(1000).optional(),
  coverImageUrl: z.string().url().optional(),
});

const AddClipInput = z.object({
  playlistId: z.string(),
  clipId: z.string(),
});

const RemoveClipInput = z.object({
  playlistId: z.string(),
  clipId: z.string(),
});

const ReorderClipsInput = z.object({
  playlistId: z.string(),
  clipId: z.string(),
  newOrder: z.number().min(0),
});

const PublishPlaylistInput = z.object({
  playlistId: z.string(),
});

const GetPlaylistsInput = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const FollowPlaylistInput = z.object({
  playlistId: z.string(),
});

// ==========================================
// PLAYLIST PROCEDURES
// ==========================================
const playlistRouter = router({
  // Create new playlist
  create: protectedProcedure
    .input(CreatePlaylistInput)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const playlistId = nanoid();
      const now = new Date();

      const playlist: InsertPlaylist = {
        id: playlistId,
        userId: ctx.user.id,
        title: input.title,
        description: input.description || null,
        coverImageUrl: input.coverImageUrl || null,
        status: "draft",
        isCollaborative: false,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(playlists).values(playlist);

      return { id: playlistId };
    }),

  // Get my playlists
  myPlaylists: protectedProcedure
    .input(GetPlaylistsInput)
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const results = await db
        .select({
          playlist: playlists,
          itemCount: count(playlistItems.id),
          followerCount: count(playlistFollowers.id),
        })
        .from(playlists)
        .leftJoin(playlistItems, eq(playlists.id, playlistItems.playlistId))
        .leftJoin(
          playlistFollowers,
          eq(playlists.id, playlistFollowers.playlistId)
        )
        .where(eq(playlists.userId, ctx.user.id))
        .groupBy(playlists.id)
        .orderBy(desc(playlists.updatedAt))
        .limit(input.limit)
        .offset(input.offset);

      return results.map(r => ({
        ...r.playlist,
        itemCount: r.itemCount,
        followerCount: r.followerCount,
      }));
    }),

  // Get public playlists
  public: publicProcedure
    .input(GetPlaylistsInput)
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const results = await db
        .select({
          playlist: playlists,
          creator: {
            id: users.id,
            name: users.name,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
          itemCount: count(playlistItems.id),
          followerCount: count(playlistFollowers.id),
        })
        .from(playlists)
        .leftJoin(users, eq(playlists.userId, users.id))
        .leftJoin(playlistItems, eq(playlists.id, playlistItems.playlistId))
        .leftJoin(
          playlistFollowers,
          eq(playlists.id, playlistFollowers.playlistId)
        )
        .where(eq(playlists.status, "published"))
        .groupBy(playlists.id, users.id)
        .orderBy(desc(playlists.publishedAt))
        .limit(input.limit)
        .offset(input.offset);

      return results.map(r => ({
        ...r.playlist,
        creator: r.creator,
        itemCount: r.itemCount,
        followerCount: r.followerCount,
      }));
    }),

  // Get playlist by ID with all clips
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const playlist = await db.query.playlists.findFirst({
        where: eq(playlists.id, input.id),
      });

      if (!playlist) return null;

      // Check if user is owner or it's published
      if (
        playlist.status === "draft" &&
        (!ctx.user || ctx.user.id !== playlist.userId)
      ) {
        return null;
      }

      const creator = await db.query.users.findFirst({
        where: eq(users.id, playlist.userId),
      });

      const items = await db
        .select({
          item: playlistItems,
          clip: clips,
        })
        .from(playlistItems)
        .leftJoin(clips, eq(playlistItems.clipId, clips.id))
        .where(eq(playlistItems.playlistId, input.id))
        .orderBy(playlistItems.order);

      const followerCount = await db
        .select({ count: count() })
        .from(playlistFollowers)
        .where(eq(playlistFollowers.playlistId, input.id));

      const isFollowing = ctx.user
        ? await db.query.playlistFollowers.findFirst({
            where: and(
              eq(playlistFollowers.playlistId, input.id),
              eq(playlistFollowers.userId, ctx.user.id)
            ),
          })
        : null;

      return {
        ...playlist,
        creator,
        clips: items.map(i => i.clip),
        followerCount: followerCount[0]?.count || 0,
        isFollowing: !!isFollowing,
      };
    }),

  // Update playlist details
  update: protectedProcedure
    .input(UpdatePlaylistInput)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const playlist = await db.query.playlists.findFirst({
        where: eq(playlists.id, input.playlistId),
      });

      if (!playlist) throw new Error("Playlist not found");
      if (playlist.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const updates: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.title) updates.title = input.title;
      if (input.description !== undefined)
        updates.description = input.description;
      if (input.coverImageUrl !== undefined)
        updates.coverImageUrl = input.coverImageUrl;

      await db
        .update(playlists)
        .set(updates)
        .where(eq(playlists.id, input.playlistId));

      return { success: true };
    }),

  // Add clip to playlist
  addClip: protectedProcedure
    .input(AddClipInput)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const playlist = await db.query.playlists.findFirst({
        where: eq(playlists.id, input.playlistId),
      });

      if (!playlist) throw new Error("Playlist not found");
      if (playlist.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      // Get next order
      const lastItem = await db
        .select()
        .from(playlistItems)
        .where(eq(playlistItems.playlistId, input.playlistId))
        .orderBy(desc(playlistItems.order))
        .limit(1);

      const nextOrder = lastItem.length > 0 ? lastItem[0].order + 1 : 0;

      await db.insert(playlistItems).values({
        playlistId: input.playlistId,
        clipId: input.clipId,
        order: nextOrder,
        addedAt: new Date(),
      });

      return { success: true };
    }),

  // Remove clip from playlist
  removeClip: protectedProcedure
    .input(RemoveClipInput)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const playlist = await db.query.playlists.findFirst({
        where: eq(playlists.id, input.playlistId),
      });

      if (!playlist) throw new Error("Playlist not found");
      if (playlist.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await db
        .delete(playlistItems)
        .where(
          and(
            eq(playlistItems.playlistId, input.playlistId),
            eq(playlistItems.clipId, input.clipId)
          )
        );

      return { success: true };
    }),

  // Reorder clips
  reorderClip: protectedProcedure
    .input(ReorderClipsInput)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const playlist = await db.query.playlists.findFirst({
        where: eq(playlists.id, input.playlistId),
      });

      if (!playlist) throw new Error("Playlist not found");
      if (playlist.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await db
        .update(playlistItems)
        .set({ order: input.newOrder })
        .where(
          and(
            eq(playlistItems.playlistId, input.playlistId),
            eq(playlistItems.clipId, input.clipId)
          )
        );

      return { success: true };
    }),

  // Publish playlist (make public)
  publish: protectedProcedure
    .input(PublishPlaylistInput)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const playlist = await db.query.playlists.findFirst({
        where: eq(playlists.id, input.playlistId),
      });

      if (!playlist) throw new Error("Playlist not found");
      if (playlist.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await db
        .update(playlists)
        .set({
          status: "published",
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(playlists.id, input.playlistId));

      return { success: true };
    }),

  // Follow playlist
  follow: protectedProcedure
    .input(FollowPlaylistInput)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db.query.playlistFollowers.findFirst({
        where: and(
          eq(playlistFollowers.playlistId, input.playlistId),
          eq(playlistFollowers.userId, ctx.user.id)
        ),
      });

      if (existing) {
        // Unfollow
        await db
          .delete(playlistFollowers)
          .where(
            and(
              eq(playlistFollowers.playlistId, input.playlistId),
              eq(playlistFollowers.userId, ctx.user.id)
            )
          );
        return { following: false };
      } else {
        // Follow
        await db.insert(playlistFollowers).values({
          playlistId: input.playlistId,
          userId: ctx.user.id,
          followedAt: new Date(),
        });
        return { following: true };
      }
    }),

  // Delete playlist
  delete: protectedProcedure
    .input(z.object({ playlistId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const playlist = await db.query.playlists.findFirst({
        where: eq(playlists.id, input.playlistId),
      });

      if (!playlist) throw new Error("Playlist not found");
      if (playlist.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      // Delete items first
      await db
        .delete(playlistItems)
        .where(eq(playlistItems.playlistId, input.playlistId));

      // Delete followers
      await db
        .delete(playlistFollowers)
        .where(eq(playlistFollowers.playlistId, input.playlistId));

      // Delete playlist
      await db.delete(playlists).where(eq(playlists.id, input.playlistId));

      return { success: true };
    }),
});

export { playlistRouter };
