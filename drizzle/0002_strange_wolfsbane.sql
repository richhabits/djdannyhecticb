CREATE TYPE "public"."comms_direction" AS ENUM('inbound', 'outbound');--> statement-breakpoint
CREATE TYPE "public"."comms_provider" AS ENUM('telnyx', 'vapi', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."hectic_channel" AS ENUM('web', 'sms', 'call', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."hectic_lead_intent" AS ENUM('booking', 'inquiry', 'fan', 'media');--> statement-breakpoint
CREATE TYPE "public"."hectic_lead_status" AS ENUM('new', 'contacted', 'converted', 'lost');--> statement-breakpoint
CREATE TYPE "public"."hectic_status" AS ENUM('active', 'booking_captured', 'signed_up', 'closed');--> statement-breakpoint
CREATE TYPE "public"."jarvis_insight_type" AS ENUM('venue_suggestion', 'marketing_copy', 'follow_up', 'trend');--> statement-breakpoint
CREATE TABLE "comms_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" "comms_provider",
	"direction" "comms_direction",
	"from_number" varchar(50),
	"to_number" varchar(50),
	"body" text,
	"status" varchar(32),
	"external_id" varchar(255),
	"conversation_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hectic_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(64) NOT NULL,
	"user_id" integer,
	"channel" "hectic_channel" DEFAULT 'web' NOT NULL,
	"status" "hectic_status" DEFAULT 'active' NOT NULL,
	"extracted_data" json,
	"lead_captured" boolean DEFAULT false NOT NULL,
	"signup_prompt_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hectic_conversations_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "hectic_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer,
	"name" varchar(255),
	"email" varchar(320),
	"phone" varchar(50),
	"organisation" varchar(255),
	"intent" "hectic_lead_intent",
	"event_type" "event_type",
	"event_date" varchar(100),
	"location" varchar(255),
	"budget" varchar(100),
	"status" "hectic_lead_status" DEFAULT 'new' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"followed_up_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "hectic_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" varchar(16) NOT NULL,
	"content" text NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jarvis_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "jarvis_insight_type" NOT NULL,
	"title" varchar(255),
	"content" text NOT NULL,
	"metadata" json,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"priority" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "comms_log" ADD CONSTRAINT "comms_log_conversation_id_hectic_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."hectic_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hectic_conversations" ADD CONSTRAINT "hectic_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hectic_leads" ADD CONSTRAINT "hectic_leads_conversation_id_hectic_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."hectic_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hectic_messages" ADD CONSTRAINT "hectic_messages_conversation_id_hectic_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."hectic_conversations"("id") ON DELETE no action ON UPDATE no action;