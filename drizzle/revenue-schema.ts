/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Revenue Streams Schema
 * - Subscription tiers
 * - Affiliate program
 * - Sponsorships
 * - Premium content access
 * - Digital products
 * - Payouts & taxes
 */

import { boolean, integer, pgEnum, pgTable, text, timestamp, varchar, numeric, json, serial, real } from "drizzle-orm/pg-core";

/**
 * ============================================
 * ENUMS - Define all enums before tables
 * ============================================
 */
export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "free",
  "subscriber",
  "vip",
  "premium",
  "family",
]);

export const subscriptionPaymentStatusEnum = pgEnum("subscription_payment_status", [
  "pending",
  "succeeded",
  "failed",
  "cancelled",
]);

export const affiliateStatusEnum = pgEnum("affiliate_status", [
  "pending",
  "approved",
  "active",
  "suspended",
  "rejected",
]);

export const affiliateCommissionTypeEnum = pgEnum("affiliate_commission_type", [
  "subscription",
  "merchandise",
  "booking",
  "donation",
  "digital_product",
]);

export const sponsorshipTierEnum = pgEnum("sponsorship_tier", [
  "bronze",
  "silver",
  "gold",
  "platinum",
]);

export const sponsorshipStatusEnum = pgEnum("sponsorship_status", [
  "pending",
  "active",
  "expired",
  "cancelled",
]);

export const premiumFeatureEnum = pgEnum("premium_feature", [
  "exclusive_streams",
  "merch_presale",
  "coaching_calls",
  "qa_sessions",
  "behind_scenes",
  "early_music_access",
  "exclusive_mixes",
  "digital_collectibles",
  "ad_free",
  "custom_color",
  "early_notifications",
  "private_chat",
  "subscriber_events",
  "custom_badge",
]);

export const digitalProductTypeEnum = pgEnum("digital_product_type", [
  "tutorial",
  "sample_pack",
  "preset",
  "remix",
  "artwork",
  "ebook",
  "nft",
  "other",
]);

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
]);

/**
 * ============================================
 * SUBSCRIPTION SYSTEM TABLES
 * ============================================
 */

/**
 * Subscription plans & tiers configuration
 */
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  plan: subscriptionPlanEnum("plan").notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  monthlyPrice: numeric("monthlyPrice", { precision: 10, scale: 2 }).notNull(),
  yearlyPrice: numeric("yearlyPrice", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  features: json("features").$type<string[]>().notNull(), // Array of premium features
  maxFamilyMembers: integer("maxFamilyMembers"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * User subscription records
 */
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  plan: subscriptionPlanEnum("plan").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  nextBillingDate: timestamp("nextBillingDate"),
  autoRenew: boolean("autoRenew").default(true).notNull(),
  billingCycle: varchar("billingCycle", { length: 20 }).default("monthly").notNull(), // monthly or yearly
  status: varchar("status", { length: 50 }).default("active").notNull(),
  cancelledAt: timestamp("cancelledAt"),
  cancelReason: text("cancelReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

/**
 * Subscription payment history
 */
export const subscriptionPayments = pgTable("subscription_payments", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscriptionId").notNull(),
  userId: integer("userId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: subscriptionPaymentStatusEnum("status").default("pending").notNull(),
  billingDate: timestamp("billingDate").notNull(),
  failureReason: text("failureReason"),
  retryCount: integer("retryCount").default(0).notNull(),
  nextRetryAt: timestamp("nextRetryAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SubscriptionPayment = typeof subscriptionPayments.$inferSelect;
export type InsertSubscriptionPayment = typeof subscriptionPayments.$inferInsert;

/**
 * ============================================
 * AFFILIATE PROGRAM TABLES
 * ============================================
 */

/**
 * Affiliate accounts
 */
export const affiliates = pgTable("affiliates", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  bio: text("bio"),
  status: affiliateStatusEnum("status").default("pending").notNull(),
  commissionRate: real("commissionRate").default(0.15).notNull(), // Default 15%
  tier: affiliateStatusEnum("tier").default("active").notNull(),
  websiteUrl: varchar("websiteUrl", { length: 512 }),
  socialProof: json("socialProof").$type<Record<string, string>>(),
  bankAccountLast4: varchar("bankAccountLast4", { length: 4 }),
  stripeConnectAccountId: varchar("stripeConnectAccountId", { length: 255 }),
  totalEarnings: numeric("totalEarnings", { precision: 15, scale: 2 }).default("0").notNull(),
  totalPaid: numeric("totalPaid", { precision: 15, scale: 2 }).default("0").notNull(),
  approvedAt: timestamp("approvedAt"),
  suspendedAt: timestamp("suspendedAt"),
  suspensionReason: text("suspensionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

/**
 * Affiliate referral links
 */
export const affiliateLinks = pgTable("affiliate_links", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  label: varchar("label", { length: 255 }),
  url: varchar("url", { length: 512 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type InsertAffiliateLink = typeof affiliateLinks.$inferInsert;

/**
 * Affiliate clicks tracking
 */
export const affiliateClicks = pgTable("affiliate_clicks", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  linkId: integer("linkId"),
  code: varchar("code", { length: 50 }).notNull(),
  referrerUrl: varchar("referrerUrl", { length: 512 }),
  userAgent: text("userAgent"),
  ipHash: varchar("ipHash", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AffiliateClick = typeof affiliateClicks.$inferSelect;
export type InsertAffiliateClick = typeof affiliateClicks.$inferInsert;

/**
 * Affiliate conversions (actual sales)
 */
export const affiliateConversions = pgTable("affiliate_conversions", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  clickId: integer("clickId"),
  code: varchar("code", { length: 50 }).notNull(),
  conversionType: affiliateCommissionTypeEnum("conversionType").notNull(),
  referenceId: integer("referenceId"), // subscription_id, purchase_id, etc.
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  commission: numeric("commission", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, approved, paid
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AffiliateConversion = typeof affiliateConversions.$inferSelect;
export type InsertAffiliateConversion = typeof affiliateConversions.$inferInsert;

/**
 * Affiliate earnings statements
 */
export const affiliateEarnings = pgTable("affiliate_earnings", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  period: varchar("period", { length: 20 }).notNull(), // YYYY-MM format
  clicks: integer("clicks").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(),
  totalAmount: numeric("totalAmount", { precision: 15, scale: 2 }).notNull(),
  commissionEarned: numeric("commissionEarned", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, paid, holded
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AffiliateEarning = typeof affiliateEarnings.$inferSelect;
export type InsertAffiliateEarning = typeof affiliateEarnings.$inferInsert;

/**
 * Affiliate payout requests
 */
export const affiliatePayouts = pgTable("affiliate_payouts", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: payoutStatusEnum("status").default("pending").notNull(),
  stripePayoutId: varchar("stripePayoutId", { length: 255 }),
  bankAccountLast4: varchar("bankAccountLast4", { length: 4 }),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AffiliatePayout = typeof affiliatePayouts.$inferSelect;
export type InsertAffiliatePayout = typeof affiliatePayouts.$inferInsert;

/**
 * ============================================
 * SPONSORSHIP TABLES
 * ============================================
 */

/**
 * Sponsorship deals
 */
export const sponsorships = pgTable("sponsorships", {
  id: serial("id").primaryKey(),
  brandName: varchar("brandName", { length: 255 }).notNull(),
  tier: sponsorshipTierEnum("tier").notNull(),
  monthlyAmount: numeric("monthlyAmount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  status: sponsorshipStatusEnum("status").default("pending").notNull(),
  logoUrl: varchar("logoUrl", { length: 512 }),
  websiteUrl: varchar("websiteUrl", { length: 512 }),
  contactEmail: varchar("contactEmail", { length: 255 }),
  termsAndConditions: text("termsAndConditions"),
  specialRequirements: text("specialRequirements"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Sponsorship = typeof sponsorships.$inferSelect;
export type InsertSponsorship = typeof sponsorships.$inferInsert;

/**
 * Sponsorship metrics
 */
export const sponsorshipMetrics = pgTable("sponsorship_metrics", {
  id: serial("id").primaryKey(),
  sponsorshipId: integer("sponsorshipId").notNull(),
  date: timestamp("date").notNull(),
  impressions: integer("impressions").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(),
  engagement: real("engagement").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SponsorshipMetric = typeof sponsorshipMetrics.$inferSelect;
export type InsertSponsorshipMetric = typeof sponsorshipMetrics.$inferInsert;

/**
 * ============================================
 * PREMIUM CONTENT & FEATURES
 * ============================================
 */

/**
 * Premium content access control
 */
export const premiumContent = pgTable("premium_content", {
  id: serial("id").primaryKey(),
  contentId: integer("contentId").notNull(),
  contentType: varchar("contentType", { length: 100 }).notNull(), // stream, mix, article, etc.
  minimumTier: subscriptionPlanEnum("minimumTier").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  previewUrl: varchar("previewUrl", { length: 512 }),
  contentUrl: varchar("contentUrl", { length: 512 }).notNull(),
  releaseDate: timestamp("releaseDate").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PremiumContent = typeof premiumContent.$inferSelect;
export type InsertPremiumContent = typeof premiumContent.$inferInsert;

/**
 * Tier features mapping
 */
export const tierFeatures = pgTable("tier_features", {
  id: serial("id").primaryKey(),
  tier: subscriptionPlanEnum("tier").notNull(),
  feature: premiumFeatureEnum("feature").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  value: text("value"), // For features with configurable values
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TierFeature = typeof tierFeatures.$inferSelect;
export type InsertTierFeature = typeof tierFeatures.$inferInsert;

/**
 * Digital products store
 */
export const digitalProducts = pgTable("digital_products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: digitalProductTypeEnum("type").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  downloadUrl: varchar("downloadUrl", { length: 512 }),
  previewUrl: varchar("previewUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  fileSize: integer("fileSize"),
  fileFormat: varchar("fileFormat", { length: 50 }),
  stock: integer("stock"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DigitalProduct = typeof digitalProducts.$inferSelect;
export type InsertDigitalProduct = typeof digitalProducts.$inferInsert;

/**
 * Digital product purchases
 */
export const digitalPurchases = pgTable("digital_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  productId: integer("productId").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  downloadToken: varchar("downloadToken", { length: 128 }).unique(),
  downloadCount: integer("downloadCount").default(0).notNull(),
  lastDownloadedAt: timestamp("lastDownloadedAt"),
  expiresAt: timestamp("expiresAt"),
  status: varchar("status", { length: 50 }).default("completed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DigitalPurchase = typeof digitalPurchases.$inferSelect;
export type InsertDigitalPurchase = typeof digitalPurchases.$inferInsert;

/**
 * ============================================
 * REVENUE ANALYTICS & PAYOUTS
 * ============================================
 */

/**
 * Revenue summary by source
 */
export const revenueSummary = pgTable("revenue_summary", {
  id: serial("id").primaryKey(),
  period: varchar("period", { length: 20 }).notNull(), // YYYY-MM format
  source: varchar("source", { length: 100 }).notNull(), // subscriptions, donations, merchandise, affiliates, sponsorships, digital_products
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  transactionCount: integer("transactionCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RevenueSummary = typeof revenueSummary.$inferSelect;
export type InsertRevenueSummary = typeof revenueSummary.$inferInsert;

/**
 * User payouts
 */
export const userPayouts = pgTable("user_payouts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: payoutStatusEnum("status").default("pending").notNull(),
  stripePayoutId: varchar("stripePayoutId", { length: 255 }),
  bankAccountLast4: varchar("bankAccountLast4", { length: 4 }),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserPayout = typeof userPayouts.$inferSelect;
export type InsertUserPayout = typeof userPayouts.$inferInsert;

/**
 * Tax records
 */
export const taxRecords = pgTable("tax_records", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  year: integer("year").notNull(),
  grossRevenue: numeric("grossRevenue", { precision: 15, scale: 2 }).notNull(),
  taxableAmount: numeric("taxableAmount", { precision: 15, scale: 2 }).notNull(),
  taxRate: real("taxRate").default(0.2).notNull(),
  taxAmount: numeric("taxAmount", { precision: 15, scale: 2 }).notNull(),
  paidAmount: numeric("paidAmount", { precision: 15, scale: 2 }).notNull(),
  form1099Id: varchar("form1099Id", { length: 255 }),
  isGenerated: boolean("isGenerated").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TaxRecord = typeof taxRecords.$inferSelect;
export type InsertTaxRecord = typeof taxRecords.$inferInsert;

/**
 * User churn tracking
 */
export const userChurn = pgTable("user_churn", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  previousPlan: subscriptionPlanEnum("previousPlan"),
  newPlan: subscriptionPlanEnum("newPlan"),
  churnDate: timestamp("churnDate").defaultNow().notNull(),
  reason: text("reason"),
  mrr_impact: numeric("mrr_impact", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserChurn = typeof userChurn.$inferSelect;
export type InsertUserChurn = typeof userChurn.$inferInsert;
