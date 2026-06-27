/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Client Portal Schema — client profiles, bookings, uploads, playlists, storage
 */

import {
  boolean, integer, pgEnum, pgTable, text, timestamp, varchar, numeric, serial, bigint
} from "drizzle-orm/pg-core";
import { users } from "./schema";

// ─── Enums ─────────────────────────────────────────────────────────────────

export const clientRoleEnum = pgEnum("client_role", [
  "booking_client",
  "artist",
  "brand",
]);

export const clientBookingStatusEnum = pgEnum("client_booking_status", [
  "enquiry",
  "confirmed",
  "completed",
  "cancelled",
]);

export const uploadTypeEnum = pgEnum("upload_type", [
  "track",
  "playlist",
  "photo",
  "video",
  "layout",
  "doc",
]);

export const uploadStatusEnum = pgEnum("upload_status", [
  "pending",
  "approved",
  "rejected",
]);

// ─── Tables ─────────────────────────────────────────────────────────────────

export const clientProfiles = pgTable("client_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  displayName: varchar("display_name", { length: 255 }),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  bio: text("bio"),
  avatarUrl: varchar("avatar_url", { length: 512 }),
  // role-specific fields
  website: varchar("website", { length: 512 }),
  instagramHandle: varchar("instagram_handle", { length: 100 }),
  genre: varchar("genre", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ClientProfile = typeof clientProfiles.$inferSelect;
export type InsertClientProfile = typeof clientProfiles.$inferInsert;

export const clientBookings = pgTable("client_bookings", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventDate: timestamp("event_date").notNull(),
  venue: varchar("venue", { length: 255 }),
  location: varchar("location", { length: 255 }).notNull(),
  duration: varchar("duration", { length: 50 }),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  requirements: text("requirements"),
  status: clientBookingStatusEnum("status").default("enquiry").notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ClientBooking = typeof clientBookings.$inferSelect;
export type InsertClientBooking = typeof clientBookings.$inferInsert;

export const clientUploads = pgTable("client_uploads", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id),
  type: uploadTypeEnum("type").notNull(),
  fileUrl: varchar("file_url", { length: 1024 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  duration: numeric("duration", { precision: 10, scale: 2 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 1024 }),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  rightsConfirmed: boolean("rights_confirmed").default(false).notNull(),
  status: uploadStatusEnum("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ClientUpload = typeof clientUploads.$inferSelect;
export type InsertClientUpload = typeof clientUploads.$inferInsert;

export const clientPlaylists = pgTable("client_playlists", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  coverUrl: varchar("cover_url", { length: 1024 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ClientPlaylist = typeof clientPlaylists.$inferSelect;
export type InsertClientPlaylist = typeof clientPlaylists.$inferInsert;

export const playlistTracks = pgTable("playlist_tracks", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull().references(() => clientPlaylists.id),
  uploadId: integer("upload_id").notNull().references(() => clientUploads.id),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PlaylistTrack = typeof playlistTracks.$inferSelect;
export type InsertPlaylistTrack = typeof playlistTracks.$inferInsert;

export const storageUsage = pgTable("storage_usage", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id).unique(),
  bytesUsed: bigint("bytes_used", { mode: "number" }).default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type StorageUsage = typeof storageUsage.$inferSelect;
export type InsertStorageUsage = typeof storageUsage.$inferInsert;
