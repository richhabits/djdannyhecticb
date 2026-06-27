/**
 * Portal tRPC router — all client portal procedures
 */

import { router, protectedProcedure, adminProcedure } from "@/server/_core/trpc";
import { TRPCError } from "@/server/_core/trpc";
import { z } from "zod";
import { getDb } from "@/server/db";
import { users } from "../../../drizzle/schema";
import {
  clientProfiles, clientBookings, clientUploads, clientPlaylists, playlistTracks, storageUsage
} from "../../../drizzle/portal-schema";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { del } from "@vercel/blob";
import { sendEmail } from "@/server/_core/email";
import { ENV } from "@/server/_core/env";

const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function requirePortalRole(user: any) {
  const portalRoles = ["booking_client", "artist", "brand", "admin"];
  if (!portalRoles.includes(user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Portal access required" });
  }
}

function serializeBooking(b: any) {
  return {
    ...b,
    budget: b.budget ? String(b.budget) : null,
  };
}

function serializeUpload(u: any) {
  return {
    ...u,
    fileSize: String(u.fileSize),
    duration: u.duration ? String(u.duration) : null,
  };
}

function serializeStorage(s: any) {
  return {
    ...s,
    bytesUsed: String(s.bytesUsed),
    quotaBytes: String(STORAGE_QUOTA_BYTES),
  };
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const portalRouter = router({
  // ── Profile ──────────────────────────────────────────────────────────────

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    requirePortalRole(ctx.user);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    const profile = await db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.userId, ctx.user.id))
      .limit(1)
      .then(r => r[0]);

    return profile ?? null;
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      displayName: z.string().max(255).optional(),
      company: z.string().max(255).optional(),
      phone: z.string().max(20).optional(),
      bio: z.string().max(2000).optional(),
      avatarUrl: z.string().max(512).optional(),
      website: z.string().max(512).optional(),
      instagramHandle: z.string().max(100).optional(),
      genre: z.string().max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requirePortalRole(ctx.user);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const existing = await db
        .select({ id: clientProfiles.id })
        .from(clientProfiles)
        .where(eq(clientProfiles.userId, ctx.user.id))
        .limit(1)
        .then(r => r[0]);

      if (existing) {
        await db.update(clientProfiles)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(clientProfiles.userId, ctx.user.id));
      } else {
        await db.insert(clientProfiles).values({ userId: ctx.user.id, ...input });
      }

      return { success: true };
    }),

  // ── Bookings ─────────────────────────────────────────────────────────────

  createBooking: protectedProcedure
    .input(z.object({
      eventType: z.string().min(1).max(100),
      eventDate: z.string(),
      venue: z.string().max(255).optional(),
      location: z.string().min(1).max(255),
      duration: z.string().max(50).optional(),
      budget: z.number().positive().optional(),
      requirements: z.string().max(5000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requirePortalRole(ctx.user);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const inserted = await db.insert(clientBookings).values({
        clientId: ctx.user.id,
        eventType: input.eventType,
        eventDate: new Date(input.eventDate),
        venue: input.venue || null,
        location: input.location,
        duration: input.duration || null,
        budget: input.budget ? String(input.budget) : null,
        requirements: input.requirements || null,
        status: "enquiry",
      }).returning({ id: clientBookings.id });

      const bookingId = inserted[0]?.id;

      // Notify Danny
      if (ENV.notificationsEmail) {
        await sendEmail({
          to: ENV.notificationsEmail,
          subject: `New Booking Enquiry from ${ctx.user.name || ctx.user.email}`,
          html: buildBookingNotificationHtml(ctx.user, input),
        });
      }

      return { success: true, id: bookingId };
    }),

  listBookings: protectedProcedure.query(async ({ ctx }) => {
    requirePortalRole(ctx.user);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    const rows = await db
      .select()
      .from(clientBookings)
      .where(eq(clientBookings.clientId, ctx.user.id))
      .orderBy(desc(clientBookings.createdAt));

    return rows.map(serializeBooking);
  }),

  // ── Uploads ──────────────────────────────────────────────────────────────

  listUploads: protectedProcedure.query(async ({ ctx }) => {
    requirePortalRole(ctx.user);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    const rows = await db
      .select()
      .from(clientUploads)
      .where(eq(clientUploads.clientId, ctx.user.id))
      .orderBy(desc(clientUploads.createdAt));

    return rows.map(serializeUpload);
  }),

  deleteUpload: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requirePortalRole(ctx.user);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const upload = await db
        .select()
        .from(clientUploads)
        .where(and(eq(clientUploads.id, input.id), eq(clientUploads.clientId, ctx.user.id)))
        .limit(1)
        .then(r => r[0]);

      if (!upload) throw new TRPCError({ code: "NOT_FOUND", message: "Upload not found" });

      // Delete from Vercel Blob
      try {
        await del(upload.fileUrl);
      } catch (e) {
        console.warn("[PortalUpload] Blob delete failed:", e);
      }

      await db.delete(clientUploads).where(eq(clientUploads.id, input.id));

      // Decrement storage usage
      await db.update(storageUsage)
        .set({
          bytesUsed: sql`GREATEST(0, ${storageUsage.bytesUsed} - ${upload.fileSize})`,
          updatedAt: new Date(),
        })
        .where(eq(storageUsage.clientId, ctx.user.id));

      return { success: true };
    }),

  // ── Storage ──────────────────────────────────────────────────────────────

  getStorageUsage: protectedProcedure.query(async ({ ctx }) => {
    requirePortalRole(ctx.user);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    const usage = await db
      .select()
      .from(storageUsage)
      .where(eq(storageUsage.clientId, ctx.user.id))
      .limit(1)
      .then(r => r[0]);

    return serializeStorage(usage ?? { clientId: ctx.user.id, bytesUsed: 0 });
  }),

  // ── Admin — Client Management ─────────────────────────────────────────────

  adminListClients: adminProcedure
    .input(z.object({
      role: z.enum(["booking_client", "artist", "brand"]).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const roleCondition = input.role
        ? eq(users.role, input.role)
        : or(
            eq(users.role, "booking_client"),
            eq(users.role, "artist"),
            eq(users.role, "brand")
          );

      const rows = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          displayName: users.displayName,
          role: users.role,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
        })
        .from(users)
        .where(roleCondition)
        .orderBy(desc(users.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return rows;
    }),

  adminGetClient: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1)
        .then(r => r[0]);

      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });

      const [profile, bookings, uploads, usage] = await Promise.all([
        db.select().from(clientProfiles).where(eq(clientProfiles.userId, input.userId)).limit(1).then(r => r[0] ?? null),
        db.select().from(clientBookings).where(eq(clientBookings.clientId, input.userId)).orderBy(desc(clientBookings.createdAt)),
        db.select().from(clientUploads).where(eq(clientUploads.clientId, input.userId)).orderBy(desc(clientUploads.createdAt)),
        db.select().from(storageUsage).where(eq(storageUsage.clientId, input.userId)).limit(1).then(r => r[0] ?? null),
      ]);

      return {
        user,
        profile,
        bookings: bookings.map(serializeBooking),
        uploads: uploads.map(serializeUpload),
        storage: usage ? serializeStorage(usage) : serializeStorage({ clientId: input.userId, bytesUsed: 0 }),
      };
    }),

  adminUpdateBooking: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["enquiry", "confirmed", "completed", "cancelled"]),
      adminNotes: z.string().max(2000).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const booking = await db
        .select({ id: clientBookings.id, clientId: clientBookings.clientId })
        .from(clientBookings)
        .where(eq(clientBookings.id, input.id))
        .limit(1)
        .then(r => r[0]);

      if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });

      await db.update(clientBookings)
        .set({ status: input.status, adminNotes: input.adminNotes ?? null, updatedAt: new Date() })
        .where(eq(clientBookings.id, input.id));

      // Notify client on status change
      if (input.status === "confirmed" || input.status === "completed") {
        const client = await db.select({ email: users.email, name: users.name })
          .from(users)
          .where(eq(users.id, booking.clientId))
          .limit(1)
          .then(r => r[0]);

        if (client?.email) {
          await sendEmail({
            to: client.email,
            subject: `Your booking has been ${input.status} — DJ Danny Hectic B`,
            html: buildBookingStatusHtml(client.name || "Client", input.status, input.adminNotes),
          });
        }
      }

      return { success: true };
    }),

  adminReviewUpload: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["approved", "rejected"]),
      adminNotes: z.string().max(1000).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const upload = await db
        .select()
        .from(clientUploads)
        .where(eq(clientUploads.id, input.id))
        .limit(1)
        .then(r => r[0]);

      if (!upload) throw new TRPCError({ code: "NOT_FOUND", message: "Upload not found" });

      await db.update(clientUploads)
        .set({ status: input.status, adminNotes: input.adminNotes ?? null, updatedAt: new Date() })
        .where(eq(clientUploads.id, input.id));

      const client = await db.select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, upload.clientId))
        .limit(1)
        .then(r => r[0]);

      if (client?.email) {
        await sendEmail({
          to: client.email,
          subject: `Your upload "${upload.title || upload.fileName}" has been ${input.status} — DJ Danny Hectic B`,
          html: buildUploadStatusHtml(client.name || "Client", upload.title || upload.fileName, input.status, input.adminNotes),
        });
      }

      return { success: true };
    }),

  adminListBookings: adminProcedure
    .input(z.object({
      status: z.enum(["enquiry", "confirmed", "completed", "cancelled"]).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const where = input.status
        ? and(eq(clientBookings.status, input.status))
        : undefined;

      const rows = await db
        .select({
          booking: clientBookings,
          clientName: users.name,
          clientEmail: users.email,
          clientRole: users.role,
        })
        .from(clientBookings)
        .leftJoin(users, eq(clientBookings.clientId, users.id))
        .where(where)
        .orderBy(desc(clientBookings.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return rows.map(r => ({ ...serializeBooking(r.booking), clientName: r.clientName, clientEmail: r.clientEmail, clientRole: r.clientRole }));
    }),

  adminListUploads: adminProcedure
    .input(z.object({
      status: z.enum(["pending", "approved", "rejected"]).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const where = input.status
        ? and(eq(clientUploads.status, input.status))
        : undefined;

      const rows = await db
        .select({
          upload: clientUploads,
          clientName: users.name,
          clientEmail: users.email,
        })
        .from(clientUploads)
        .leftJoin(users, eq(clientUploads.clientId, users.id))
        .where(where)
        .orderBy(desc(clientUploads.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return rows.map(r => ({ ...serializeUpload(r.upload), clientName: r.clientName, clientEmail: r.clientEmail }));
    }),
});

// ─── Email Templates ──────────────────────────────────────────────────────────

function buildBookingNotificationHtml(user: any, input: any): string {
  return `<!DOCTYPE html>
<html><head><style>body{font-family:Arial,sans-serif;background:#000;color:#fff;margin:0;padding:0}
.c{max-width:600px;margin:0 auto;padding:20px}
.h{background:#f97316;padding:20px;text-align:center}
.h h1{color:#000;margin:0;font-size:22px}
.b{background:#111;padding:20px;border:1px solid #333}
.row{margin:10px 0;padding:10px;background:#1a1a1a;border-left:4px solid #f97316}
.label{color:#f97316;font-weight:bold;font-size:12px;text-transform:uppercase}
</style></head><body><div class="c">
<div class="h"><h1>New Booking Enquiry</h1></div>
<div class="b">
<div class="row"><div class="label">From</div><div>${user.name || user.email} (${user.email})</div></div>
<div class="row"><div class="label">Event Type</div><div>${input.eventType}</div></div>
<div class="row"><div class="label">Date</div><div>${input.eventDate}</div></div>
<div class="row"><div class="label">Location</div><div>${input.location}${input.venue ? ` — ${input.venue}` : ""}</div></div>
${input.duration ? `<div class="row"><div class="label">Duration</div><div>${input.duration}</div></div>` : ""}
${input.budget ? `<div class="row"><div class="label">Budget</div><div>£${input.budget}</div></div>` : ""}
${input.requirements ? `<div class="row"><div class="label">Requirements</div><div>${input.requirements}</div></div>` : ""}
</div></div></body></html>`;
}

function buildBookingStatusHtml(name: string, status: string, notes?: string): string {
  const statusLabel = status === "confirmed" ? "Confirmed ✅" : "Completed 🎉";
  return `<!DOCTYPE html>
<html><head><style>body{font-family:Arial,sans-serif;background:#000;color:#fff;margin:0;padding:0}
.c{max-width:600px;margin:0 auto;padding:20px}
.h{background:#f97316;padding:20px;text-align:center}
.h h1{color:#000;margin:0;font-size:22px}
.b{background:#111;padding:20px;border:1px solid #333}
</style></head><body><div class="c">
<div class="h"><h1>Booking ${statusLabel}</h1></div>
<div class="b">
<p>Hi ${name},</p>
<p>Your booking with DJ Danny Hectic B has been <strong>${status}</strong>.</p>
${notes ? `<p><strong>Note from Danny:</strong><br>${notes}</p>` : ""}
<p>If you have any questions, reply to this email or visit your portal dashboard.</p>
<p>— DJ Danny Hectic B Team</p>
</div></div></body></html>`;
}

function buildUploadStatusHtml(name: string, fileName: string, status: string, notes?: string): string {
  const icon = status === "approved" ? "✅" : "❌";
  return `<!DOCTYPE html>
<html><head><style>body{font-family:Arial,sans-serif;background:#000;color:#fff;margin:0;padding:0}
.c{max-width:600px;margin:0 auto;padding:20px}
.h{background:#f97316;padding:20px;text-align:center}
.h h1{color:#000;margin:0;font-size:22px}
.b{background:#111;padding:20px;border:1px solid #333}
</style></head><body><div class="c">
<div class="h"><h1>Upload ${status === "approved" ? "Approved" : "Rejected"} ${icon}</h1></div>
<div class="b">
<p>Hi ${name},</p>
<p>Your upload <strong>"${fileName}"</strong> has been <strong>${status}</strong>.</p>
${notes ? `<p><strong>Note:</strong> ${notes}</p>` : ""}
<p>Visit your portal to manage your media library.</p>
<p>— DJ Danny Hectic B Team</p>
</div></div></body></html>`;
}
