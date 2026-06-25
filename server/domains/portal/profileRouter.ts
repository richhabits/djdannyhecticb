/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { router, clientProcedure } from "@/server/_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { clientProfiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const profileUpdateSchema = z.object({
  displayName: z.string().max(255).optional(),
  company: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(2000).optional(),
  avatarUrl: z.string().url().optional(),
  artistGenre: z.string().max(100).optional(),
  brandIndustry: z.string().max(100).optional(),
});

export const portalProfileRouter = router({
  get: clientProcedure.query(async ({ ctx }) => {
    if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [profile] = await ctx.db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.userId, ctx.user.id))
      .limit(1);

    return profile ?? null;
  }),

  upsert: clientProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [existing] = await ctx.db
        .select({ id: clientProfiles.id })
        .from(clientProfiles)
        .where(eq(clientProfiles.userId, ctx.user.id))
        .limit(1);

      if (existing) {
        const [updated] = await ctx.db
          .update(clientProfiles)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(clientProfiles.userId, ctx.user.id))
          .returning();
        return updated;
      }

      const [created] = await ctx.db
        .insert(clientProfiles)
        .values({ userId: ctx.user.id, ...input })
        .returning();
      return created;
    }),
});
