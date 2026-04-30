-- Add contact_messages table for contact form submissions
CREATE TABLE IF NOT EXISTS "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(20),
	"message" text NOT NULL,
	"ipAddress" varchar(45),
	"status" varchar(50) NOT NULL DEFAULT 'new',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"respondedAt" timestamp
);

-- Create index on email for quick lookups
CREATE INDEX IF NOT EXISTS "contact_messages_email_idx" on "contact_messages" ("email");
CREATE INDEX IF NOT EXISTS "contact_messages_status_idx" on "contact_messages" ("status");
CREATE INDEX IF NOT EXISTS "contact_messages_created_at_idx" on "contact_messages" ("createdAt");
