CREATE TABLE "supporter_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"weekStart" timestamp NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"breakdown" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
