/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { router, clientProcedure, adminProcedure } from "@/server/_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { bookings, users } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { sendBookingSubmittedEmail, sendBookingStatusEmail } from "./notifications";

const createBookingSchema = z.object({
  eventType: z.string().min(1).max(100),
  eventDate: z.coerce.date(),
  venue: z.string().max(255).optional(),
  location: z.string().min(1).max(255),
  duration: z.string().max(50).optional(),
  budget: z.coerce.number().nonnegative().optional(),
  requirements: z.string().max(5000).optional(),
});

export const bookingsRouter = router({
  // Client: create a booking enquiry
  create: clientProcedure
    .input(createBookingSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [created] = await ctx.db
        .insert(bookings)
        .values({
          userId: ctx.user.id,
          eventType: input.eventType,
          eventDate: input.eventDate,
          venue: input.venue,
          location: input.location,
          duration: input.duration,
          budget: input.budget !== undefined ? input.budget.toString() : undefined,
          requirements: input.requirements,
        })
        .returning();

      if (ctx.user.email) {
        await sendBookingSubmittedEmail(created, ctx.user.email, ctx.user.name || ctx.user.displayName || ctx.user.email);
      }

      return created;
    }),

  // Client: list own bookings
  listMine: clientProcedure.query(async ({ ctx }) => {
    if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    return ctx.db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, ctx.user.id))
      .orderBy(desc(bookings.createdAt));
  }),

  // Admin: list all bookings, joined with client info
  listAll: adminProcedure.query(async ({ ctx }) => {
    if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    return ctx.db
      .select({
        booking: bookings,
        client: { id: users.id, name: users.name, email: users.email, role: users.role },
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .orderBy(desc(bookings.createdAt));
  }),

  // Admin: update status / notes (approve/confirm/complete/cancel)
  updateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["enquiry", "confirmed", "completed", "cancelled"]),
      notes: z.string().max(5000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [updated] = await ctx.db
        .update(bookings)
        .set({ status: input.status, notes: input.notes, updatedAt: new Date() })
        .where(eq(bookings.id, input.id))
        .returning();

      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });

      if (input.status === "confirmed" || input.status === "completed") {
        const [client] = await ctx.db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, updated.userId))
          .limit(1);

        if (client?.email) {
          await sendBookingStatusEmail(updated, client.email);
        }
      }

      return updated;
    }),
});
