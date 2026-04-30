-- Add shipping_method enum type
CREATE TYPE shipping_method AS ENUM ('standard', 'express', 'international');

-- Add shipping columns to purchases table
ALTER TABLE "purchases" ADD COLUMN "shippingAddress" text;
ALTER TABLE "purchases" ADD COLUMN "shippingCity" varchar(255);
ALTER TABLE "purchases" ADD COLUMN "shippingPostalCode" varchar(20);
ALTER TABLE "purchases" ADD COLUMN "shippingCountry" varchar(100);
ALTER TABLE "purchases" ADD COLUMN "shippingCost" numeric(10, 2);
ALTER TABLE "purchases" ADD COLUMN "shippingMethod" shipping_method;

-- Add merch columns to products table
ALTER TABLE "products" ADD COLUMN "printfullProductId" varchar(255);
ALTER TABLE "products" ADD COLUMN "merchCategory" varchar(100);

-- Create indexes on shipping columns for fast lookups
CREATE INDEX IF NOT EXISTS "purchases_shipping_country_idx" on "purchases" ("shippingCountry");
CREATE INDEX IF NOT EXISTS "purchases_shipping_method_idx" on "purchases" ("shippingMethod");
CREATE INDEX IF NOT EXISTS "products_merch_category_idx" on "products" ("merchCategory");
CREATE INDEX IF NOT EXISTS "products_printfull_id_idx" on "products" ("printfullProductId");
