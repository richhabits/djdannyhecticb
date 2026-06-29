CREATE TYPE "public"."client_booking_status" AS ENUM('enquiry', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."client_role" AS ENUM('booking_client', 'artist', 'brand');--> statement-breakpoint
CREATE TYPE "public"."upload_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."upload_type" AS ENUM('track', 'playlist', 'photo', 'video', 'layout', 'doc');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'booking_client';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'artist';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'brand';--> statement-breakpoint
CREATE TABLE "client_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "client_playlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"cover_url" varchar(1024),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"display_name" varchar(255),
	"company" varchar(255),
	"phone" varchar(20),
	"bio" text,
	"avatar_url" varchar(512),
	"website" varchar(512),
	"instagram_handle" varchar(100),
	"genre" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "playlist_tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"playlist_id" integer NOT NULL,
	"upload_id" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storage_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"bytes_used" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "storage_usage_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
ALTER TABLE "client_bookings" ADD CONSTRAINT "client_bookings_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_playlists" ADD CONSTRAINT "client_playlists_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_uploads" ADD CONSTRAINT "client_uploads_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_playlist_id_client_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."client_playlists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_upload_id_client_uploads_id_fk" FOREIGN KEY ("upload_id") REFERENCES "public"."client_uploads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_usage" ADD CONSTRAINT "storage_usage_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;