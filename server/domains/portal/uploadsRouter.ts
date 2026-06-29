/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { router, clientProcedure, adminProcedure } from "@/server/_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { users } from "@/drizzle/schema";
import { clientUploads as uploads } from "@/drizzle/portal-schema";
import { eq, desc, and } from "drizzle-orm";
import { sendUploadStatusEmail } from "./notifications";
import { adjustStorageUsage, getStorageUsageBytes, STORAGE_QUOTA_BYTES } from "./storageQuota";

export const uploadsRouter = router({
  // Client: list own uploads, optionally filtered by type
  listMine: clientProcedure
    .input(z.object({ type: z.enum(["track", "playlist", "photo", "video", "layout", "doc"]).optional() }).optional())
    .query(async ({ ctx, input }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const conditions = [eq(uploads.userId, ctx.user.id)];
      if (input?.type) conditions.push(eq(uploads.type, input.type));

      return ctx.db
        .select()
        .from(uploads)
        .where(and(...conditions))
        .orderBy(desc(uploads.createdAt));
    }),

  // Client: storage usage meter
  usage: clientProcedure.query(async ({ ctx }) => {
    const bytesUsed = await getStorageUsageBytes(ctx.user.id);
    return { bytesUsed, quotaBytes: STORAGE_QUOTA_BYTES };
  }),

  // Client: delete own upload
  delete: clientProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [existing] = await ctx.db
        .select()
        .from(uploads)
        .where(and(eq(uploads.id, input.id), eq(uploads.userId, ctx.user.id)))
        .limit(1);

      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Upload not found" });

      await ctx.db.delete(uploads).where(eq(uploads.id, input.id));
      await adjustStorageUsage(ctx.user.id, -existing.fileSize);

      return { success: true };
    }),

  // Admin: list all uploads, joined with client info
  listAll: adminProcedure
    .input(z.object({ status: z.enum(["pending", "approved", "rejected"]).optional() }).optional())
    .query(async ({ ctx, input }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const conditions = input?.status ? [eq(uploads.status, input.status)] : [];

      return ctx.db
        .select({
          upload: uploads,
          client: { id: users.id, name: users.name, email: users.email, role: users.role },
        })
        .from(uploads)
        .innerJoin(users, eq(uploads.userId, users.id))
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(uploads.createdAt));
    }),

  // Admin: approve or reject an upload
  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["approved", "rejected"]) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [updated] = await ctx.db
        .update(uploads)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(uploads.id, input.id))
        .returning();

      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Upload not found" });

      const [client] = await ctx.db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, updated.userId))
        .limit(1);

      if (client?.email) {
        await sendUploadStatusEmail(updated, client.email);
      }

      return updated;
    }),
});
