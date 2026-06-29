-- Client Portal Migration
-- Adds portal roles to user_role enum and creates portal-specific tables

-- Extend user_role enum with portal client roles
ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'booking_client';
ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'artist';
ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'brand';

-- ─── New enums ─────────────────────────────────────────────────────────────

DO $$ BEGIN
 CREATE TYPE "public"."client_booking_status" AS ENUM('enquiry', 'confirmed', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."upload_type" AS ENUM('track', 'playlist', 'photo', 'video', 'layout', 'doc');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."upload_status" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- ─── client_profiles ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "client_profiles" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "display_name" varchar(255),
  "company" varchar(255),
  "phone" varchar(20),
  "bio" text,
  "avatar_url" varchar(512),
  "website" varchar(512),
  "instagram_handle" varchar(100),
  "genre" varchar(100),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "client_profiles_user_id_unique" UNIQUE("user_id")
);

-- ─── client_bookings ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "client_bookings" (
  "id" serial PRIMARY KEY NOT NULL,
  "client_id" integer NOT NULL REFERENCES "users"("id"),
  "event_type" varchar(100) NOT NULL,
  "event_date" timestamp NOT NULL,
  "venue" varchar(255),
  "location" varchar(255) NOT NULL,
  "duration" varchar(50),
  "budget" numeric(10, 2),
  "requirements" text,
  "status" "client_booking_status" DEFAULT 'enquiry' NOT NULL,
  "admin_notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- ─── client_uploads ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "client_uploads" (
  "id" serial PRIMARY KEY NOT NULL,
  "client_id" integer NOT NULL REFERENCES "users"("id"),
  "type" "upload_type" NOT NULL,
  "file_url" varchar(1024) NOT NULL,
  "file_name" varchar(255) NOT NULL,
  "file_size" bigint NOT NULL,
  "mime_type" varchar(100),
  "duration" numeric(10, 2),
  "thumbnail_url" varchar(1024),
  "title" varchar(255),
  "description" text,
  "rights_confirmed" boolean DEFAULT false NOT NULL,
  "status" "upload_status" DEFAULT 'pending' NOT NULL,
  "admin_notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- ─── client_playlists ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "client_playlists" (
  "id" serial PRIMARY KEY NOT NULL,
  "client_id" integer NOT NULL REFERENCES "users"("id"),
  "title" varchar(255) NOT NULL,
  "description" text,
  "cover_url" varchar(1024),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- ─── playlist_tracks ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "playlist_tracks" (
  "id" serial PRIMARY KEY NOT NULL,
  "playlist_id" integer NOT NULL REFERENCES "client_playlists"("id"),
  "upload_id" integer NOT NULL REFERENCES "client_uploads"("id"),
  "position" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- ─── storage_usage ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "storage_usage" (
  "id" serial PRIMARY KEY NOT NULL,
  "client_id" integer NOT NULL REFERENCES "users"("id"),
  "bytes_used" bigint DEFAULT 0 NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "storage_usage_client_id_unique" UNIQUE("client_id")
);

-- ─── Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "client_bookings_client_id_idx" ON "client_bookings"("client_id");
CREATE INDEX IF NOT EXISTS "client_bookings_status_idx" ON "client_bookings"("status");
CREATE INDEX IF NOT EXISTS "client_uploads_client_id_idx" ON "client_uploads"("client_id");
CREATE INDEX IF NOT EXISTS "client_uploads_status_idx" ON "client_uploads"("status");
CREATE INDEX IF NOT EXISTS "client_playlists_client_id_idx" ON "client_playlists"("client_id");
CREATE INDEX IF NOT EXISTS "playlist_tracks_playlist_id_idx" ON "playlist_tracks"("playlist_id");
