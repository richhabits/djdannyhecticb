CREATE TABLE `booking_blockers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blockedDate` varchar(20) NOT NULL,
	`reason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `booking_blockers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `booking_contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`status` enum('draft','issued','signed','voided') NOT NULL DEFAULT 'draft',
	`content` text NOT NULL,
	`signedAt` timestamp,
	`signedBy` varchar(255),
	`ipAddress` varchar(45),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `booking_contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `governance_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` varchar(255) NOT NULL,
	`actorId` int,
	`reason` text,
	`snapshot` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `governance_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outbound_interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`type` enum('email','dm','call','automated_quote') NOT NULL,
	`content` text,
	`outcome` varchar(255),
	`auditLogId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `outbound_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outbound_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`email` varchar(255),
	`phone` varchar(20),
	`organisation` varchar(255),
	`source` enum('scraping','social','referral','manual') NOT NULL DEFAULT 'manual',
	`sourceFingerprint` varchar(255),
	`geoContext` varchar(255),
	`targetDate` varchar(20),
	`status` enum('new','qualified','contacted','converted','dead') NOT NULL DEFAULT 'new',
	`leadScore` int NOT NULL DEFAULT 0,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `outbound_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricing_audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int,
	`baseRate` decimal(10,2) NOT NULL,
	`finalTotal` decimal(10,2) NOT NULL,
	`rulesApplied` text,
	`breakdown` text,
	`conversionStatus` enum('quote_served','payment_started','deposit_paid','expired') NOT NULL DEFAULT 'quote_served',
	`geoContext` varchar(255),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricing_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricing_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleType` enum('weekend_uplift','short_notice','location_band','base_rate') NOT NULL,
	`ruleValue` decimal(10,2) NOT NULL,
	`ruleStrategy` enum('fixed','percentage') NOT NULL DEFAULT 'fixed',
	`conditions` text,
	`maxMultiplier` decimal(10,2),
	`minTotal` decimal(10,2),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pricing_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revenue_incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('pricing_drift','payment_mismatch','inventory_deadlock','manual_override') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`message` text NOT NULL,
	`status` enum('active','investigating','mitigated','resolved') NOT NULL DEFAULT 'active',
	`impactedQuotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `revenue_incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tech_riders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`requirements` text NOT NULL,
	`hospitality` text,
	`isApproved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tech_riders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `event_bookings` ADD `status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `event_bookings` ADD `totalAmount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `event_bookings` ADD `depositAmount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `event_bookings` ADD `depositPaid` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `event_bookings` ADD `depositExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `event_bookings` ADD `paymentIntentId` varchar(255);--> statement-breakpoint
ALTER TABLE `event_bookings` ADD `pricingBreakdown` text;