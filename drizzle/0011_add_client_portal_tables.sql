-- Client Portal: roles, bookings, uploads, playlists, storage quota
-- The pre-existing "bookings" table was dead code (no router ever read/wrote
-- it), so it's dropped and recreated with the portal's shape rather than
-- migrated column-by-column.

ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'booking_client';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'artist';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'brand';--> statement-breakpoint

DROP TABLE IF EXISTS "bookings" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."booking_status";--> statement-breakpoint

CREATE TYPE "public"."client_booking_status" AS ENUM('enquiry', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."upload_type" AS ENUM('track', 'playlist', 'photo', 'video', 'layout', 'doc');--> statement-breakpoint
CREATE TYPE "public"."upload_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint

CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"eventType" varchar(100) NOT NULL,
	"eventDate" timestamp NOT NULL,
	"venue" varchar(255),
	"location" varchar(255) NOT NULL,
	"duration" varchar(50),
	"budget" numeric(10, 2),
	"requirements" text,
	"status" "public"."client_booking_status" DEFAULT 'enquiry' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "client_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"displayName" varchar(255),
	"company" varchar(255),
	"phone" varchar(20),
	"bio" text,
	"avatarUrl" varchar(512),
	"artistGenre" varchar(100),
	"brandIndustry" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_profiles_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint

CREATE TABLE "uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" "public"."upload_type" NOT NULL,
	"fileUrl" varchar(1024) NOT NULL,
	"fileName" varchar(512) NOT NULL,
	"fileSize" integer NOT NULL,
	"mimeType" varchar(128) NOT NULL,
	"duration" integer,
	"thumbnailUrl" varchar(1024),
	"title" varchar(255),
	"description" text,
	"rightsConfirmed" boolean DEFAULT false NOT NULL,
	"status" "public"."upload_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "client_playlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"coverUrl" varchar(1024),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "client_playlist_tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"playlistId" integer NOT NULL,
	"uploadId" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "storage_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"bytesUsed" numeric(20, 0) DEFAULT '0' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "storage_usage_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_bookings_user_created" ON "bookings" ("userId", "createdAt" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookings_status_created" ON "bookings" ("status", "createdAt" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_uploads_user_created" ON "uploads" ("userId", "createdAt" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_uploads_status_created" ON "uploads" ("status", "createdAt" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_client_playlist_tracks_playlist" ON "client_playlist_tracks" ("playlistId", "position");
