CREATE TYPE "public"."achievement_rarity" AS ENUM('common', 'rare', 'epic', 'legendary');--> statement-breakpoint
CREATE TYPE "public"."booking_contract_status" AS ENUM('draft', 'issued', 'signed', 'voided');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."brand_archetype" AS ENUM('dj', 'podcaster', 'creator', 'brand', 'station');--> statement-breakpoint
CREATE TYPE "public"."brand_type" AS ENUM('personality', 'station', 'clothing', 'pets', 'other');--> statement-breakpoint
CREATE TYPE "public"."collectible_rarity" AS ENUM('common', 'rare', 'epic', 'legendary');--> statement-breakpoint
CREATE TYPE "public"."collectible_type" AS ENUM('badge', 'nft', 'trophy', 'item', 'skin');--> statement-breakpoint
CREATE TYPE "public"."conversion_status" AS ENUM('quote_served', 'payment_started', 'deposit_paid', 'expired');--> statement-breakpoint
CREATE TYPE "public"."danny_react_status" AS ENUM('pending', 'reacted', 'published');--> statement-breakpoint
CREATE TYPE "public"."danny_react_type" AS ENUM('video', 'meme', 'track');--> statement-breakpoint
CREATE TYPE "public"."dj_battle_status" AS ENUM('pending', 'reviewed', 'published');--> statement-breakpoint
CREATE TYPE "public"."error_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."event_booking_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('club', 'radio', 'private', 'brand', 'other');--> statement-breakpoint
CREATE TYPE "public"."fan_badge_tier" AS ENUM('rookie', 'regular', 'veteran', 'royalty');--> statement-breakpoint
CREATE TYPE "public"."feed_post_type" AS ENUM('post', 'photo', 'clip', 'mix');--> statement-breakpoint
CREATE TYPE "public"."governance_actor_type" AS ENUM('system', 'admin', 'ai_ops');--> statement-breakpoint
CREATE TYPE "public"."incident_severity" AS ENUM('info', 'warning', 'error');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('web_push', 'email', 'whatsapp', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'failed', 'read');--> statement-breakpoint
CREATE TYPE "public"."outbound_interaction_type" AS ENUM('email', 'dm', 'call', 'automated_quote');--> statement-breakpoint
CREATE TYPE "public"."outbound_source" AS ENUM('scraping', 'social', 'referral', 'manual');--> statement-breakpoint
CREATE TYPE "public"."outbound_status" AS ENUM('new', 'qualified', 'contacted', 'converted', 'dead');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('stripe', 'paypal', 'manual');--> statement-breakpoint
CREATE TYPE "public"."personalized_shoutout_type" AS ENUM('birthday', 'roast', 'motivational', 'breakup', 'custom');--> statement-breakpoint
CREATE TYPE "public"."pricing_rule_type" AS ENUM('weekend_uplift', 'short_notice', 'location_band', 'base_rate');--> statement-breakpoint
CREATE TYPE "public"."pricing_strategy" AS ENUM('fixed', 'percentage');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('drop', 'soundpack', 'preset', 'course', 'bundle', 'other');--> statement-breakpoint
CREATE TYPE "public"."promo_source_type" AS ENUM('mix', 'show', 'shout', 'reaction');--> statement-breakpoint
CREATE TYPE "public"."promo_status" AS ENUM('pending', 'generated', 'published');--> statement-breakpoint
CREATE TYPE "public"."promo_type" AS ENUM('clip', 'subtitle', 'thumbnail', 'post');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('pending', 'completed', 'refunded', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."revenue_incident_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."revenue_incident_status" AS ENUM('active', 'investigating', 'mitigated', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."revenue_incident_type" AS ENUM('pricing_drift', 'payment_mismatch', 'inventory_deadlock', 'manual_override');--> statement-breakpoint
CREATE TYPE "public"."stream_type" AS ENUM('shoutcast', 'icecast', 'custom');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('hectic_regular', 'hectic_royalty', 'inner_circle');--> statement-breakpoint
CREATE TYPE "public"."superfan_tier" AS ENUM('bronze', 'silver', 'gold', 'platinum');--> statement-breakpoint
CREATE TYPE "public"."support_event_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."track_status" AS ENUM('pending', 'queued', 'played');--> statement-breakpoint
CREATE TYPE "public"."user_post_type" AS ENUM('text', 'image', 'video', 'audio', 'clip');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"iconUrl" varchar(512),
	"pointsReward" integer DEFAULT 0 NOT NULL,
	"rarity" "achievement_rarity" DEFAULT 'common' NOT NULL,
	"criteria" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"email" varchar(320) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"lastLoginAt" timestamp,
	"failedLoginAttempts" integer DEFAULT 0 NOT NULL,
	"lockedUntil" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_credentials_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ai_danny_chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"profileId" integer,
	"sessionId" varchar(64) NOT NULL,
	"message" text NOT NULL,
	"response" text,
	"context" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_mixes" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"mood" varchar(100) NOT NULL,
	"bpm" integer,
	"genres" text NOT NULL,
	"setlist" text NOT NULL,
	"narrative" text,
	"title" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event" varchar(80) NOT NULL,
	"path" varchar(512),
	"referrer" varchar(512),
	"userAgent" varchar(512),
	"ipHash" varchar(64),
	"props" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(64) NOT NULL,
	"label" varchar(255) NOT NULL,
	"scopes" text,
	"lastUsedAt" timestamp,
	"expiresAt" timestamp,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"category" varchar(100),
	"coverImageUrl" varchar(512),
	"authorId" integer,
	"authorName" varchar(255),
	"isPublished" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actorId" integer,
	"actorName" varchar(255),
	"action" varchar(100) NOT NULL,
	"entityType" varchar(100),
	"entityId" integer,
	"beforeSnapshot" text,
	"afterSnapshot" text,
	"ipAddress" varchar(45),
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "backups" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(255) NOT NULL,
	"description" text,
	"dataBlob" text,
	"checksum" varchar(64),
	"sizeBytes" integer,
	"createdBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_blockers" (
	"id" serial PRIMARY KEY NOT NULL,
	"blockedDate" varchar(20) NOT NULL,
	"reason" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"bookingId" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "booking_contract_status" DEFAULT 'draft' NOT NULL,
	"content" text NOT NULL,
	"signedAt" timestamp,
	"signedBy" varchar(255),
	"ipAddress" varchar(45),
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"eventName" varchar(255) NOT NULL,
	"eventDate" timestamp NOT NULL,
	"eventLocation" varchar(255) NOT NULL,
	"eventType" varchar(100) NOT NULL,
	"guestCount" integer,
	"budget" varchar(100),
	"description" text,
	"contactEmail" varchar(320) NOT NULL,
	"contactPhone" varchar(20),
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" "brand_type" NOT NULL,
	"archetype" "brand_archetype",
	"primaryColor" varchar(20),
	"secondaryColor" varchar(20),
	"logoUrl" varchar(512),
	"domain" varchar(255),
	"defaultFeatureFlags" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "collectibles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" "collectible_type" NOT NULL,
	"rarity" "collectible_rarity" DEFAULT 'common' NOT NULL,
	"imageUrl" varchar(512),
	"metadata" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "danny_reacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"name" varchar(255) NOT NULL,
	"type" "danny_react_type" NOT NULL,
	"mediaUrl" varchar(512) NOT NULL,
	"title" varchar(255),
	"aiReaction" text,
	"aiRating" integer,
	"status" "danny_react_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "danny_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" varchar(100) NOT NULL,
	"message" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dj_battles" (
	"id" serial PRIMARY KEY NOT NULL,
	"djName" varchar(255) NOT NULL,
	"djEmail" varchar(255),
	"mixUrl" varchar(512) NOT NULL,
	"mixTitle" varchar(255),
	"aiCritique" text,
	"aiScore" integer,
	"aiImprovements" text,
	"status" "dj_battle_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empire_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"description" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"updatedBy" integer,
	CONSTRAINT "empire_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "error_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"route" varchar(255),
	"method" varchar(10),
	"stackSnippet" text,
	"message" text,
	"severity" "error_severity" DEFAULT 'medium' NOT NULL,
	"userId" integer,
	"ipAddress" varchar(45),
	"userAgent" text,
	"resolved" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"organisation" varchar(255),
	"eventType" "event_type" NOT NULL,
	"eventDate" varchar(20) NOT NULL,
	"eventTime" varchar(10) NOT NULL,
	"location" varchar(255) NOT NULL,
	"budgetRange" varchar(100),
	"setLength" varchar(100),
	"streamingRequired" boolean DEFAULT false NOT NULL,
	"extraNotes" text,
	"marketingConsent" boolean DEFAULT false NOT NULL,
	"dataConsent" boolean DEFAULT false NOT NULL,
	"status" "event_booking_status" DEFAULT 'pending' NOT NULL,
	"totalAmount" numeric(10, 2),
	"depositAmount" numeric(10, 2),
	"depositPaid" boolean DEFAULT false NOT NULL,
	"depositExpiresAt" timestamp,
	"paymentIntentId" varchar(255),
	"pricingBreakdown" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"eventDate" timestamp NOT NULL,
	"location" varchar(255) NOT NULL,
	"imageUrl" varchar(512),
	"ticketUrl" varchar(512),
	"price" varchar(100),
	"isFeatured" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fan_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"name" varchar(255) NOT NULL,
	"tier" "fan_badge_tier" NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"onlineTime" integer DEFAULT 0 NOT NULL,
	"shoutCount" integer DEFAULT 0 NOT NULL,
	"lastActive" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "feed_post_type" NOT NULL,
	"title" varchar(255),
	"content" text,
	"mediaUrl" varchar(512),
	"thumbnailUrl" varchar(512),
	"aiCaption" text,
	"reactions" text,
	"isPublic" boolean DEFAULT true NOT NULL,
	"isVipOnly" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"followerId" integer NOT NULL,
	"followingId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genz_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"username" varchar(50) NOT NULL,
	"displayName" varchar(255),
	"bio" text,
	"avatarUrl" varchar(512),
	"bannerUrl" varchar(512),
	"location" varchar(255),
	"website" varchar(255),
	"streakDays" integer DEFAULT 0 NOT NULL,
	"totalPoints" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"followersCount" integer DEFAULT 0 NOT NULL,
	"followingCount" integer DEFAULT 0 NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"isPublic" boolean DEFAULT true NOT NULL,
	"lastActive" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "genz_profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "governance_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actorId" integer,
	"actorType" "governance_actor_type" NOT NULL,
	"action" varchar(255) NOT NULL,
	"userId" integer,
	"reason" text,
	"payload" text,
	"snapshot" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity_quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"identityType" varchar(100) NOT NULL,
	"playlist" text,
	"welcomeMessage" text,
	"answers" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incident_banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"severity" "incident_severity" DEFAULT 'info' NOT NULL,
	"isActive" boolean DEFAULT false NOT NULL,
	"startAt" timestamp DEFAULT now() NOT NULL,
	"endAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listener_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"city" varchar(255),
	"country" varchar(255),
	"latitude" varchar(20),
	"longitude" varchar(20),
	"fanTier" "fan_badge_tier",
	"lastSeen" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"totalOnlineTime" integer DEFAULT 0 NOT NULL,
	"totalShouts" integer DEFAULT 0 NOT NULL,
	"streakDays" integer DEFAULT 0 NOT NULL,
	"lastActive" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_library" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"originalName" varchar(255) NOT NULL,
	"mimeType" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"url" varchar(512) NOT NULL,
	"uploadedBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mixes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"audioUrl" varchar(512) NOT NULL,
	"coverImageUrl" varchar(512),
	"duration" integer,
	"genre" varchar(100),
	"isFree" boolean DEFAULT true NOT NULL,
	"downloadUrl" varchar(512),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"fanId" integer,
	"fanName" varchar(255),
	"email" varchar(255),
	"type" varchar(100) NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"payload" text,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"sentAt" timestamp,
	"readAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbound_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer NOT NULL,
	"type" "outbound_interaction_type" NOT NULL,
	"content" text,
	"outcome" varchar(255),
	"auditLogId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbound_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"phone" varchar(20),
	"organisation" varchar(255),
	"source" "outbound_source" DEFAULT 'manual' NOT NULL,
	"sourceFingerprint" varchar(255),
	"geoContext" varchar(255),
	"targetDate" varchar(20),
	"status" "outbound_status" DEFAULT 'new' NOT NULL,
	"leadScore" integer DEFAULT 0 NOT NULL,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personalized_shoutouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipientName" varchar(255) NOT NULL,
	"recipientEmail" varchar(255),
	"type" "personalized_shoutout_type" NOT NULL,
	"message" text NOT NULL,
	"delivered" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "podcasts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"episodeNumber" integer,
	"audioUrl" varchar(512) NOT NULL,
	"coverImageUrl" varchar(512),
	"duration" integer,
	"spotifyUrl" varchar(512),
	"applePodcastsUrl" varchar(512),
	"youtubeUrl" varchar(512),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"profileId" integer NOT NULL,
	"reactionType" varchar(20) DEFAULT 'like' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"bookingId" integer,
	"baseRate" numeric(10, 2) NOT NULL,
	"finalTotal" numeric(10, 2) NOT NULL,
	"rulesApplied" text,
	"breakdown" text,
	"conversionStatus" "conversion_status" DEFAULT 'quote_served' NOT NULL,
	"geoContext" varchar(255),
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"ruleType" "pricing_rule_type" NOT NULL,
	"ruleValue" numeric(10, 2) NOT NULL,
	"ruleStrategy" "pricing_strategy" DEFAULT 'fixed' NOT NULL,
	"conditions" text,
	"maxMultiplier" numeric(10, 2),
	"minTotal" numeric(10, 2),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" "product_type" NOT NULL,
	"price" varchar(50) NOT NULL,
	"currency" varchar(10) DEFAULT 'GBP' NOT NULL,
	"downloadUrl" varchar(512),
	"thumbnailUrl" varchar(512),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "promo_type" NOT NULL,
	"sourceType" "promo_source_type" NOT NULL,
	"sourceId" integer,
	"content" text,
	"mediaUrl" varchar(512),
	"thumbnailUrl" varchar(512),
	"status" "promo_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"fanId" integer,
	"fanName" varchar(255) NOT NULL,
	"email" varchar(255),
	"productId" integer NOT NULL,
	"amount" varchar(50) NOT NULL,
	"currency" varchar(10) DEFAULT 'GBP' NOT NULL,
	"status" "purchase_status" DEFAULT 'pending' NOT NULL,
	"paymentProvider" "payment_provider",
	"paymentIntentId" varchar(255),
	"paypalOrderId" varchar(255),
	"transactionId" varchar(255),
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revenue_incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "revenue_incident_type" NOT NULL,
	"severity" "revenue_incident_severity" NOT NULL,
	"message" text NOT NULL,
	"status" "revenue_incident_status" DEFAULT 'active' NOT NULL,
	"impactedQuotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"resolvedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "shouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" varchar(255),
	"message" text NOT NULL,
	"trackRequest" varchar(255),
	"isTrackRequest" boolean DEFAULT false NOT NULL,
	"trackTitle" varchar(255),
	"trackArtist" varchar(255),
	"votes" integer DEFAULT 0 NOT NULL,
	"trackStatus" "track_status" DEFAULT 'pending',
	"phone" varchar(20),
	"email" varchar(255),
	"heardFrom" varchar(255),
	"genres" text,
	"whatsappOptIn" boolean DEFAULT false NOT NULL,
	"canReadOnAir" boolean DEFAULT false NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"readOnAir" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shows" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"host" varchar(255),
	"description" text,
	"dayOfWeek" integer NOT NULL,
	"startTime" varchar(10) NOT NULL,
	"endTime" varchar(10) NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streamingLinks" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" varchar(100) NOT NULL,
	"url" varchar(512) NOT NULL,
	"displayName" varchar(255),
	"icon" varchar(255),
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "stream_type" NOT NULL,
	"publicUrl" varchar(512) NOT NULL,
	"sourceHost" varchar(255),
	"sourcePort" integer,
	"mount" varchar(255),
	"statsUrl" varchar(512),
	"streamId" integer,
	"adminApiUrl" varchar(512),
	"adminUser" varchar(255),
	"adminPassword" varchar(255),
	"isActive" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"fanId" integer,
	"fanName" varchar(255) NOT NULL,
	"email" varchar(255),
	"tier" "subscription_tier" NOT NULL,
	"amount" varchar(50) NOT NULL,
	"currency" varchar(10) DEFAULT 'GBP' NOT NULL,
	"startAt" timestamp DEFAULT now() NOT NULL,
	"endAt" timestamp,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "superfans" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"tier" "superfan_tier" NOT NULL,
	"perks" text,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"fanId" integer,
	"fanName" varchar(255) NOT NULL,
	"email" varchar(255),
	"amount" varchar(50) NOT NULL,
	"currency" varchar(10) DEFAULT 'GBP' NOT NULL,
	"message" text,
	"status" "support_event_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tech_riders" (
	"id" serial PRIMARY KEY NOT NULL,
	"bookingId" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"requirements" text NOT NULL,
	"hospitality" text,
	"isApproved" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"artist" varchar(255) NOT NULL,
	"note" text,
	"playedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"profileId" integer NOT NULL,
	"achievementId" integer NOT NULL,
	"unlockedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_collectibles" (
	"id" serial PRIMARY KEY NOT NULL,
	"profileId" integer NOT NULL,
	"collectibleId" integer NOT NULL,
	"acquiredAt" timestamp DEFAULT now() NOT NULL,
	"isEquipped" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"profileId" integer NOT NULL,
	"type" "user_post_type" NOT NULL,
	"content" text,
	"mediaUrl" varchar(512),
	"thumbnailUrl" varchar(512),
	"likesCount" integer DEFAULT 0 NOT NULL,
	"commentsCount" integer DEFAULT 0 NOT NULL,
	"sharesCount" integer DEFAULT 0 NOT NULL,
	"viewsCount" integer DEFAULT 0 NOT NULL,
	"isPublic" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"genres" text,
	"personalityTags" text,
	"shoutFrequency" integer DEFAULT 0 NOT NULL,
	"vibeLevel" integer DEFAULT 1 NOT NULL,
	"whatsappOptIn" boolean DEFAULT false NOT NULL,
	"aiMemoryEnabled" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"displayName" varchar(255),
	"city" varchar(100),
	"avatarUrl" varchar(512),
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"isSupporter" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"passwordHash" varchar(255),
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"youtubeUrl" varchar(512) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text,
	"thumbnailUrl" varchar(512),
	"isFeatured" boolean DEFAULT false NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"duration" varchar(20),
	"publishedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
