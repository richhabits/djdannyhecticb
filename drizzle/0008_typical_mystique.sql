CREATE TABLE `city_lanes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`city` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`genres` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`config` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `city_lanes_id` PRIMARY KEY(`id`),
	CONSTRAINT `city_lanes_city_unique` UNIQUE(`city`),
	CONSTRAINT `city_lanes_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `connector_sync_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectorId` int NOT NULL,
	`status` enum('success','error','partial') NOT NULL,
	`itemsIngested` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`durationMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `connector_sync_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connectors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`config` text NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT false,
	`lastSyncAt` timestamp,
	`syncIntervalMs` int NOT NULL DEFAULT 3600000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `connectors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feature_flags` (
	`key` varchar(64) NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feature_flags_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `intel_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`laneId` int,
	`category` enum('ticket-alert','event-intel','set-release','underground-news') NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`genre` varchar(100) NOT NULL,
	`secondaryGenre` varchar(100),
	`tags` text,
	`sourceType` enum('ticketing_api','rss','venue_feed','promoter_feed','operator','ai_synthesis') NOT NULL,
	`sourceName` varchar(100) NOT NULL,
	`sourceUrl` varchar(512) NOT NULL,
	`sourceId` varchar(255),
	`confidence` decimal(3,2) DEFAULT '1.00',
	`metadata` text,
	`publishedAt` timestamp NOT NULL,
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `intel_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inviterId` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`targetCity` varchar(100),
	`redeemedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `invites_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `lane_daily_rollups` (
	`laneId` varchar(100) NOT NULL,
	`day` timestamp NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`saves` int NOT NULL DEFAULT 0,
	`alertEnables` int NOT NULL DEFAULT 0,
	`signups` int NOT NULL DEFAULT 0,
	`inviteRedemptions` int NOT NULL DEFAULT 0,
	`avgConfidence` decimal(3,2) DEFAULT '1.00'
);
--> statement-breakpoint
CREATE TABLE `saved_signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entityType` enum('intel','mix','clip','event','track','podcast') NOT NULL,
	`entityId` varchar(255) NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `source_daily_rollups` (
	`sourceType` varchar(50) NOT NULL,
	`day` timestamp NOT NULL,
	`ingested` int NOT NULL DEFAULT 0,
	`served` int NOT NULL DEFAULT 0,
	`saved` int NOT NULL DEFAULT 0,
	`avgConfidence` decimal(3,2) DEFAULT '1.00',
	`failCount` int NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `supporter_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weekStart` timestamp NOT NULL,
	`score` int NOT NULL,
	`breakdown` text,
	`computedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supporter_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_signal_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`city` varchar(100),
	`metricType` enum('view','save','follow','share') NOT NULL,
	`score` int NOT NULL DEFAULT 1,
	`lastInteractionAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_signal_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `governance_logs` ADD `actorType` enum('system','admin','ai_ops') NOT NULL;--> statement-breakpoint
ALTER TABLE `governance_logs` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `governance_logs` ADD `payload` text;--> statement-breakpoint
ALTER TABLE `users` ADD `displayName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `users` ADD `isSupporter` boolean DEFAULT false NOT NULL;