-- Add Printfull products catalog table
CREATE TABLE IF NOT EXISTS "printfull_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"imageUrl" varchar(512),
	"variants" json,
	"price" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Add merch orders table
CREATE TABLE IF NOT EXISTS "merch_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchaseId" integer NOT NULL,
	"printfullOrderId" integer,
	"status" varchar(50) NOT NULL DEFAULT 'pending',
	"trackingNumber" varchar(255),
	"trackingUrl" varchar(512),
	"shippingAddress" text,
	"items" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "printfull_products_category_idx" on "printfull_products" ("category");
CREATE INDEX IF NOT EXISTS "printfull_products_product_id_idx" on "printfull_products" ("productId");
CREATE INDEX IF NOT EXISTS "merch_orders_purchase_id_idx" on "merch_orders" ("purchaseId");
CREATE INDEX IF NOT EXISTS "merch_orders_printfull_id_idx" on "merch_orders" ("printfullOrderId");
CREATE INDEX IF NOT EXISTS "merch_orders_status_idx" on "merch_orders" ("status");
