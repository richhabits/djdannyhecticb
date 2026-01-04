CREATE TABLE `marketing_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('outreach','social','email','advertising','partnership','other') NOT NULL,
	`targetAudience` text,
	`startDate` timestamp,
	`endDate` timestamp,
	`budget` decimal(10,2),
	`status` enum('draft','active','paused','completed','cancelled') NOT NULL DEFAULT 'draft',
	`metrics` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketing_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketing_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('club','bar','venue','festival','event','radio','other') NOT NULL,
	`location` varchar(255) NOT NULL,
	`address` text,
	`email` varchar(320),
	`phone` varchar(20),
	`website` varchar(512),
	`socialMedia` text,
	`capacity` int,
	`genre` varchar(255),
	`notes` text,
	`status` enum('new','contacted','interested','quoted','booked','declined','archived') NOT NULL DEFAULT 'new',
	`source` varchar(255),
	`assignedTo` int,
	`lastContacted` timestamp,
	`nextFollowUp` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketing_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outreach_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`campaignId` int,
	`type` enum('email','phone','social','in_person','other') NOT NULL,
	`subject` varchar(255),
	`message` text,
	`response` text,
	`status` enum('sent','delivered','opened','replied','bounced','failed') NOT NULL DEFAULT 'sent',
	`performedBy` int NOT NULL,
	`performedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `outreach_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_media_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentQueueId` int,
	`platform` enum('instagram','tiktok','youtube','twitter','facebook','linkedin','threads','other') NOT NULL,
	`type` enum('post','story','reel','video','carousel','live','other') NOT NULL,
	`caption` text,
	`mediaUrls` text,
	`hashtags` text,
	`mentions` text,
	`location` varchar(255),
	`status` enum('draft','scheduled','posted','failed','archived') NOT NULL DEFAULT 'draft',
	`scheduledAt` timestamp,
	`postedAt` timestamp,
	`externalPostId` varchar(255),
	`externalUrl` varchar(512),
	`metrics` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_media_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `venue_scraper_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`source` varchar(255) NOT NULL,
	`sourceUrl` varchar(512),
	`rawData` text,
	`processed` boolean NOT NULL DEFAULT false,
	`convertedToLead` boolean NOT NULL DEFAULT false,
	`leadId` int,
	`scrapedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `venue_scraper_results_id` PRIMARY KEY(`id`)
);
