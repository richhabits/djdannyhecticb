/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { router, adminProcedure } from "@/server/_core/trpc";
import { TRPCError } from "@trpc/server";
import { users, bookings } from "@/drizzle/schema";
import { clientProfiles, clientUploads as uploads } from "@/drizzle/portal-schema";
import { inArray, sql } from "drizzle-orm";

const PORTAL_ROLES = ["booking_client", "artist", "brand"] as const;

export const clientsRouter = router({
  // Admin: roster of all portal clients with profile + activity counts
  listAll: adminProcedure.query(async ({ ctx }) => {
    if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const clientUsers = await ctx.db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
      .from(users)
      .where(inArray(users.role, PORTAL_ROLES));

    if (!clientUsers.length) return [];

    const userIds = clientUsers.map((u) => u.id);

    const [profiles, bookingCounts, uploadCounts] = await Promise.all([
      ctx.db.select().from(clientProfiles).where(inArray(clientProfiles.userId, userIds)),
      ctx.db
        .select({ userId: bookings.userId, count: sql<number>`count(*)::int` })
        .from(bookings)
        .where(inArray(bookings.userId, userIds))
        .groupBy(bookings.userId),
      ctx.db
        .select({ userId: uploads.userId, count: sql<number>`count(*)::int` })
        .from(uploads)
        .where(inArray(uploads.userId, userIds))
        .groupBy(uploads.userId),
    ]);

    const profileByUserId = new Map(profiles.map((p) => [p.userId, p]));
    const bookingCountByUserId = new Map(bookingCounts.map((b) => [b.userId, b.count]));
    const uploadCountByUserId = new Map(uploadCounts.map((u) => [u.userId, u.count]));

    return clientUsers.map((u) => ({
      ...u,
      profile: profileByUserId.get(u.id) ?? null,
      bookingCount: bookingCountByUserId.get(u.id) ?? 0,
      uploadCount: uploadCountByUserId.get(u.id) ?? 0,
    }));
  }),
});
