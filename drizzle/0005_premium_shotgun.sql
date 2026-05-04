CREATE TYPE "public"."notification_type" AS ENUM('follower', 'subscriber', 'donation', 'milestone', 'raid', 'host');--> statement-breakpoint
CREATE TYPE "public"."poll_status" AS ENUM('active', 'closed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."reaction_type" AS ENUM('fire', 'love', 'hype', 'laugh', 'sad', 'angry', 'thinking');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('spam', 'harassment', 'hate_speech', 'inappropriate_content', 'misinformation', 'impersonation', 'scam', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('open', 'reviewing', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."reputation_badge_type" AS ENUM('trusted', 'contributor', 'influencer', 'moderator', 'verified', 'early_supporter', 'community_champion');--> statement-breakpoint
CREATE TYPE "public"."user_badge_type" AS ENUM('subscriber', 'moderator', 'founder', 'first_100', 'first_1000', 'donation_100', 'donation_500', 'donation_1000', 'vip', 'banned', 'muted', 'warned');--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"live_session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"message" text NOT NULL,
	"username_color" varchar(7) DEFAULT '#ffffff' NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" integer,
	"deleted_reason" varchar(255),
	"emotes" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clip_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"clip_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"parent_comment_id" integer,
	"like_count" integer DEFAULT 0 NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comment_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "comment_likes_unique" UNIQUE("comment_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "community_highlights" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"featured_user_id" integer,
	"featured_comment_id" integer,
	"featured_clip_id" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"reason" text,
	"featured_by" integer NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user1_id" integer NOT NULL,
	"user2_id" integer NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_unique" UNIQUE("user1_id","user2_id")
);
--> statement-breakpoint
CREATE TABLE "custom_emotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"streamer_id" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"image_url" varchar(512) NOT NULL,
	"tier" varchar(50) DEFAULT 'free' NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "direct_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"content" text NOT NULL,
	"image_url" varchar(512),
	"read_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"live_session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"message" text,
	"stripe_payment_id" varchar(255),
	"stripe_charge_id" varchar(255),
	"status" varchar(50) DEFAULT 'completed' NOT NULL,
	"tip_jar" boolean DEFAULT false NOT NULL,
	"anonymous" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "donations_stripe_payment_id_unique" UNIQUE("stripe_payment_id"),
	CONSTRAINT "donations_stripe_charge_id_unique" UNIQUE("stripe_charge_id")
);
--> statement-breakpoint
CREATE TABLE "leaderboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"live_session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"total_donations" numeric(10, 2) DEFAULT '0' NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"reaction_count" integer DEFAULT 0 NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"rank" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"poll_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"option_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "poll_votes_user_poll_unique" UNIQUE("user_id","poll_id")
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" serial PRIMARY KEY NOT NULL,
	"live_session_id" integer NOT NULL,
	"created_by" integer NOT NULL,
	"question" varchar(255) NOT NULL,
	"options" json NOT NULL,
	"status" "poll_status" DEFAULT 'active' NOT NULL,
	"total_votes" integer DEFAULT 0 NOT NULL,
	"vote_counts" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "raids" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_streamer_id" integer NOT NULL,
	"to_streamer_id" integer NOT NULL,
	"viewers_raided" integer NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"live_session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"reaction_type" "reaction_type" NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"combo_streak" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" integer NOT NULL,
	"reported_user_id" integer,
	"reported_comment_id" integer,
	"reason" "report_reason" NOT NULL,
	"description" text,
	"status" "report_status" DEFAULT 'open' NOT NULL,
	"reviewed_by" integer,
	"review_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "reputation_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"badge_type" "reputation_badge_type" NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL,
	"metadata" json DEFAULT '{}'::json,
	CONSTRAINT "reputation_badges_unique" UNIQUE("user_id","badge_type")
);
--> statement-breakpoint
CREATE TABLE "reputation_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"trust_level" varchar(50) DEFAULT 'new' NOT NULL,
	"messages_count" integer DEFAULT 0 NOT NULL,
	"clips_count" integer DEFAULT 0 NOT NULL,
	"donations_count" integer DEFAULT 0 NOT NULL,
	"violations_count" integer DEFAULT 0 NOT NULL,
	"last_updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reputation_scores_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"twitter_url" varchar(512),
	"instagram_url" varchar(512),
	"tiktok_url" varchar(512),
	"youtube_url" varchar(512),
	"discord_url" varchar(512),
	"twitch_url" varchar(512),
	"affiliate_links" json DEFAULT '{}'::json,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "social_links_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "streamer_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"streamer_user_id" integer NOT NULL,
	"total_viewers" integer DEFAULT 0 NOT NULL,
	"total_tips_24h" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_tips_all_time" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_followers" integer DEFAULT 0 NOT NULL,
	"total_subscribers" integer DEFAULT 0 NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"experience" integer DEFAULT 0 NOT NULL,
	"badges" json DEFAULT '[]'::json,
	"last_updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "streamer_stats_streamer_user_id_unique" UNIQUE("streamer_user_id")
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"badge_type" "user_badge_type" NOT NULL,
	"live_session_id" integer,
	"earned_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"metadata" json DEFAULT '{}'::json,
	CONSTRAINT "user_badges_user_type_session_unique" UNIQUE("user_id","badge_type","live_session_id")
);
--> statement-breakpoint
CREATE TABLE "user_bans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"reason" text NOT NULL,
	"banned_by" integer NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"appealed_at" timestamp,
	"appeal_reason" text,
	"appeal_status" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles_extended" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"bio" varchar(500),
	"avatar_url" varchar(512),
	"banner_url" varchar(512),
	"pronouns" varchar(50),
	"location" varchar(255),
	"verified" boolean DEFAULT false NOT NULL,
	"verification_badge" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_extended_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "follows" RENAME COLUMN "createdAt" TO "follower_id";--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN "following_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "streamer_user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "platform_type" varchar(50);--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "title" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "is_live" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "viewer_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "total_tips" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "started_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "ended_at" timestamp;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "live_session_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "notification_type" "notification_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "title" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "message" text NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "metadata" json DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "is_read" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "chat_messages_session_idx" ON "chat_messages" USING btree ("live_session_id");--> statement-breakpoint
CREATE INDEX "chat_messages_user_idx" ON "chat_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_messages_pinned_idx" ON "chat_messages" USING btree ("is_pinned");--> statement-breakpoint
CREATE INDEX "chat_messages_created_idx" ON "chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "clip_comments_clip_idx" ON "clip_comments" USING btree ("clip_id");--> statement-breakpoint
CREATE INDEX "clip_comments_user_idx" ON "clip_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "clip_comments_parent_idx" ON "clip_comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "comment_likes_comment_idx" ON "comment_likes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "comment_likes_user_idx" ON "comment_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "community_highlights_user_idx" ON "community_highlights" USING btree ("featured_user_id");--> statement-breakpoint
CREATE INDEX "community_highlights_comment_idx" ON "community_highlights" USING btree ("featured_comment_id");--> statement-breakpoint
CREATE INDEX "community_highlights_type_idx" ON "community_highlights" USING btree ("type");--> statement-breakpoint
CREATE INDEX "conversations_user1_idx" ON "conversations" USING btree ("user1_id");--> statement-breakpoint
CREATE INDEX "conversations_user2_idx" ON "conversations" USING btree ("user2_id");--> statement-breakpoint
CREATE INDEX "custom_emotes_streamer_idx" ON "custom_emotes" USING btree ("streamer_id");--> statement-breakpoint
CREATE INDEX "custom_emotes_name_idx" ON "custom_emotes" USING btree ("name");--> statement-breakpoint
CREATE INDEX "direct_messages_conversation_idx" ON "direct_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "direct_messages_sender_idx" ON "direct_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "direct_messages_read_idx" ON "direct_messages" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "donations_session_idx" ON "donations" USING btree ("live_session_id");--> statement-breakpoint
CREATE INDEX "donations_user_idx" ON "donations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "donations_status_idx" ON "donations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "donations_stripe_payment_idx" ON "donations" USING btree ("stripe_payment_id");--> statement-breakpoint
CREATE INDEX "donations_created_idx" ON "donations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leaderboards_session_idx" ON "leaderboards" USING btree ("live_session_id");--> statement-breakpoint
CREATE INDEX "leaderboards_user_idx" ON "leaderboards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "leaderboards_donation_idx" ON "leaderboards" USING btree ("total_donations");--> statement-breakpoint
CREATE INDEX "leaderboards_rank_idx" ON "leaderboards" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "poll_votes_poll_idx" ON "poll_votes" USING btree ("poll_id");--> statement-breakpoint
CREATE INDEX "poll_votes_user_idx" ON "poll_votes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "polls_session_idx" ON "polls" USING btree ("live_session_id");--> statement-breakpoint
CREATE INDEX "polls_status_idx" ON "polls" USING btree ("status");--> statement-breakpoint
CREATE INDEX "raids_from_idx" ON "raids" USING btree ("from_streamer_id");--> statement-breakpoint
CREATE INDEX "raids_to_idx" ON "raids" USING btree ("to_streamer_id");--> statement-breakpoint
CREATE INDEX "reactions_session_idx" ON "reactions" USING btree ("live_session_id");--> statement-breakpoint
CREATE INDEX "reactions_user_idx" ON "reactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reactions_type_idx" ON "reactions" USING btree ("reaction_type");--> statement-breakpoint
CREATE INDEX "reactions_created_idx" ON "reactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reports_reporter_idx" ON "reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "reports_reported_user_idx" ON "reports" USING btree ("reported_user_id");--> statement-breakpoint
CREATE INDEX "reports_reported_comment_idx" ON "reports" USING btree ("reported_comment_id");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reputation_badges_user_idx" ON "reputation_badges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reputation_badges_badge_idx" ON "reputation_badges" USING btree ("badge_type");--> statement-breakpoint
CREATE INDEX "reputation_scores_user_idx" ON "reputation_scores" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reputation_scores_score_idx" ON "reputation_scores" USING btree ("score");--> statement-breakpoint
CREATE INDEX "social_links_user_idx" ON "social_links" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "streamer_stats_streamer_idx" ON "streamer_stats" USING btree ("streamer_user_id");--> statement-breakpoint
CREATE INDEX "user_badges_user_idx" ON "user_badges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_badges_type_idx" ON "user_badges" USING btree ("badge_type");--> statement-breakpoint
CREATE INDEX "user_badges_session_idx" ON "user_badges" USING btree ("live_session_id");--> statement-breakpoint
CREATE INDEX "user_bans_user_idx" ON "user_bans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_bans_end_date_idx" ON "user_bans" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "user_profiles_user_idx" ON "user_profiles_extended" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_profiles_verified_idx" ON "user_profiles_extended" USING btree ("verified");--> statement-breakpoint
CREATE INDEX "follows_follower_idx" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follows_following_idx" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "live_sessions_streamer_idx" ON "live_sessions" USING btree ("streamer_user_id");--> statement-breakpoint
CREATE INDEX "live_sessions_is_live_idx" ON "live_sessions" USING btree ("is_live");--> statement-breakpoint
CREATE INDEX "notifications_session_idx" ON "notifications" USING btree ("live_session_id");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("notification_type");--> statement-breakpoint
ALTER TABLE "follows" DROP COLUMN "followerId";--> statement-breakpoint
ALTER TABLE "follows" DROP COLUMN "followingId";--> statement-breakpoint
ALTER TABLE "live_sessions" DROP COLUMN "showId";--> statement-breakpoint
ALTER TABLE "live_sessions" DROP COLUMN "episodeId";--> statement-breakpoint
ALTER TABLE "live_sessions" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "live_sessions" DROP COLUMN "livePlatform";--> statement-breakpoint
ALTER TABLE "live_sessions" DROP COLUMN "liveUrl";--> statement-breakpoint
ALTER TABLE "live_sessions" DROP COLUMN "streamId";--> statement-breakpoint
ALTER TABLE "live_sessions" DROP COLUMN "startedAt";--> statement-breakpoint
ALTER TABLE "live_sessions" DROP COLUMN "endedAt";--> statement-breakpoint
ALTER TABLE "live_sessions" DROP COLUMN "scheduledAt";--> statement-breakpoint
ALTER TABLE "live_sessions" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "live_sessions" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "fanId";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "fanName";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "channel";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "payload";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "sentAt";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "readAt";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_unique" UNIQUE("follower_id","following_id");