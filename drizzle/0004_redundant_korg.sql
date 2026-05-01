CREATE TYPE "public"."cue_status" AS ENUM('pending', 'done', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."cue_type" AS ENUM('playTrack', 'readShout', 'playConfession', 'askQuestion', 'adBreak', 'topicIntro', 'callToAction', 'custom');--> statement-breakpoint
CREATE TYPE "public"."faq_category" AS ENUM('booking', 'merch', 'technical', 'shipping', 'general');--> statement-breakpoint
CREATE TYPE "public"."live_session_status" AS ENUM('upcoming', 'live', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."platform_type" AS ENUM('youtube', 'twitch', 'tiktok', 'instagram', 'own_stream');--> statement-breakpoint
CREATE TYPE "public"."refund_request_reason" AS ENUM('damaged', 'wrong_item', 'not_as_described', 'changed_mind', 'other');--> statement-breakpoint
CREATE TYPE "public"."refund_request_status" AS ENUM('pending', 'approved', 'denied', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."shipping_method" AS ENUM('standard', 'express', 'international');--> statement-breakpoint
CREATE TYPE "public"."show_phase9_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
ALTER TYPE "public"."product_type" ADD VALUE 'vinyl' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."product_type" ADD VALUE 'merch' BEFORE 'other';--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"excerpt" varchar(512),
	"author" varchar(255),
	"featuredImageUrl" varchar(512),
	"tags" text,
	"published" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(20),
	"message" text NOT NULL,
	"ipAddress" varchar(45),
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"respondedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "cues" (
	"id" serial PRIMARY KEY NOT NULL,
	"liveSessionId" integer NOT NULL,
	"type" "cue_type" NOT NULL,
	"payload" text,
	"orderIndex" integer DEFAULT 0 NOT NULL,
	"status" "cue_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" varchar(512) NOT NULL,
	"answer" text NOT NULL,
	"category" "faq_category" NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"showId" integer NOT NULL,
	"episodeId" integer,
	"status" "live_session_status" DEFAULT 'upcoming' NOT NULL,
	"livePlatform" "platform_type" DEFAULT 'own_stream' NOT NULL,
	"liveUrl" varchar(512),
	"streamId" integer,
	"startedAt" timestamp,
	"endedAt" timestamp,
	"scheduledAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merch_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchaseId" integer NOT NULL,
	"printfullOrderId" integer,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"trackingNumber" varchar(255),
	"trackingUrl" varchar(512),
	"shippingAddress" text,
	"items" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_live_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" "platform_type" NOT NULL,
	"channelId" varchar(255),
	"isLive" boolean DEFAULT false NOT NULL,
	"streamTitle" varchar(512),
	"streamUrl" varchar(512),
	"embedUrl" varchar(512),
	"thumbnailUrl" varchar(512),
	"viewerCount" integer,
	"manualOverride" boolean DEFAULT false NOT NULL,
	"lastCheckedAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platform_live_status_platform_unique" UNIQUE("platform")
);
--> statement-breakpoint
CREATE TABLE "printfull_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"imageUrl" varchar(512),
	"variants" json,
	"price" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "printfull_products_productId_unique" UNIQUE("productId")
);
--> statement-breakpoint
CREATE TABLE "refund_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchaseId" integer NOT NULL,
	"reason" "refund_request_reason" NOT NULL,
	"details" text,
	"status" "refund_request_status" DEFAULT 'pending' NOT NULL,
	"adminId" integer,
	"responseNotes" text,
	"requestedAt" timestamp DEFAULT now() NOT NULL,
	"respondedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "show_episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"showId" integer NOT NULL,
	"title" varchar(255),
	"description" text,
	"recordingUrl" varchar(512),
	"coverImageUrl" varchar(512),
	"status" varchar(50) DEFAULT 'planned' NOT NULL,
	"publishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shows_phase9" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"hostName" varchar(255),
	"coverImageUrl" varchar(512),
	"isPrimaryShow" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shows_phase9_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "stock" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "shippingRequired" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "downloadToken" varchar(128);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "beatportUrl" varchar(512);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "soundcloudUrl" varchar(512);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "spotifyUrl" varchar(512);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "printfullProductId" varchar(255);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "merchCategory" varchar(100);--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "shippingAddress" text;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "shippingCity" varchar(255);--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "shippingPostalCode" varchar(20);--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "shippingCountry" varchar(100);--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "shippingCost" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "shippingMethod" "shipping_method";--> statement-breakpoint
ALTER TABLE "streams" ADD COLUMN "showName" varchar(255);--> statement-breakpoint
ALTER TABLE "streams" ADD COLUMN "hostName" varchar(255);--> statement-breakpoint
ALTER TABLE "streams" ADD COLUMN "category" varchar(100);