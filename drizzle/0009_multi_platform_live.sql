-- Create enums for multi-platform live streaming
CREATE TYPE "public"."platform_type" AS ENUM('youtube', 'twitch', 'tiktok', 'instagram', 'own_stream');
CREATE TYPE "public"."live_session_status" AS ENUM('upcoming', 'live', 'completed', 'cancelled');
CREATE TYPE "public"."cue_type" AS ENUM('playTrack', 'readShout', 'playConfession', 'askQuestion', 'adBreak', 'topicIntro', 'callToAction', 'custom');
CREATE TYPE "public"."cue_status" AS ENUM('pending', 'done', 'skipped');
CREATE TYPE "public"."show_phase9_status" AS ENUM('draft', 'published', 'archived');

-- Add columns to streams table
ALTER TABLE "public"."streams" ADD COLUMN "showName" character varying(255);
ALTER TABLE "public"."streams" ADD COLUMN "hostName" character varying(255);
ALTER TABLE "public"."streams" ADD COLUMN "category" character varying(100);

-- Create shows_phase9 table
CREATE TABLE "public"."shows_phase9" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" character varying(255) NOT NULL,
  "slug" character varying(255) NOT NULL UNIQUE,
  "description" text,
  "hostName" character varying(255),
  "coverImageUrl" character varying(512),
  "isPrimaryShow" boolean DEFAULT false NOT NULL,
  "isActive" boolean DEFAULT true NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Create show_episodes table
CREATE TABLE "public"."show_episodes" (
  "id" serial PRIMARY KEY NOT NULL,
  "showId" integer NOT NULL,
  "title" character varying(255),
  "description" text,
  "recordingUrl" character varying(512),
  "coverImageUrl" character varying(512),
  "status" character varying(50) DEFAULT 'planned' NOT NULL,
  "publishedAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Create live_sessions table
CREATE TABLE "public"."live_sessions" (
  "id" serial PRIMARY KEY NOT NULL,
  "showId" integer NOT NULL,
  "episodeId" integer,
  "status" "public"."live_session_status" DEFAULT 'upcoming' NOT NULL,
  "livePlatform" "public"."platform_type" DEFAULT 'own_stream' NOT NULL,
  "liveUrl" character varying(512),
  "streamId" integer,
  "startedAt" timestamp,
  "endedAt" timestamp,
  "scheduledAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Create cues table
CREATE TABLE "public"."cues" (
  "id" serial PRIMARY KEY NOT NULL,
  "liveSessionId" integer NOT NULL,
  "type" "public"."cue_type" NOT NULL,
  "payload" text,
  "orderIndex" integer DEFAULT 0 NOT NULL,
  "status" "public"."cue_status" DEFAULT 'pending' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Create platform_live_status table
CREATE TABLE "public"."platform_live_status" (
  "id" serial PRIMARY KEY NOT NULL,
  "platform" "public"."platform_type" NOT NULL UNIQUE,
  "channelId" character varying(255),
  "isLive" boolean DEFAULT false NOT NULL,
  "streamTitle" character varying(512),
  "streamUrl" character varying(512),
  "embedUrl" character varying(512),
  "thumbnailUrl" character varying(512),
  "viewerCount" integer,
  "manualOverride" boolean DEFAULT false NOT NULL,
  "lastCheckedAt" timestamp,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX "shows_phase9_slug_idx" ON "public"."shows_phase9" ("slug");
CREATE INDEX "shows_phase9_isPrimaryShow_idx" ON "public"."shows_phase9" ("isPrimaryShow");
CREATE INDEX "show_episodes_showId_idx" ON "public"."show_episodes" ("showId");
CREATE INDEX "live_sessions_showId_idx" ON "public"."live_sessions" ("showId");
CREATE INDEX "live_sessions_status_idx" ON "public"."live_sessions" ("status");
CREATE INDEX "cues_liveSessionId_idx" ON "public"."cues" ("liveSessionId");
CREATE INDEX "platform_live_status_platform_idx" ON "public"."platform_live_status" ("platform");
