CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventName` varchar(255) NOT NULL,
	`eventDate` timestamp NOT NULL,
	`eventLocation` varchar(255) NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`guestCount` int,
	`budget` varchar(100),
	`description` text,
	`contactEmail` varchar(320) NOT NULL,
	`contactPhone` varchar(20),
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`eventDate` timestamp NOT NULL,
	`location` varchar(255) NOT NULL,
	`imageUrl` varchar(512),
	`ticketUrl` varchar(512),
	`price` varchar(100),
	`isFeatured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mixes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`audioUrl` varchar(512) NOT NULL,
	`coverImageUrl` varchar(512),
	`duration` int,
	`genre` varchar(100),
	`isFree` boolean NOT NULL DEFAULT true,
	`downloadUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mixes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `podcasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`episodeNumber` int,
	`audioUrl` varchar(512) NOT NULL,
	`coverImageUrl` varchar(512),
	`duration` int,
	`spotifyUrl` varchar(512),
	`applePodcastsUrl` varchar(512),
	`youtubeUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `podcasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `streamingLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` varchar(100) NOT NULL,
	`url` varchar(512) NOT NULL,
	`displayName` varchar(255),
	`icon` varchar(255),
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `streamingLinks_id` PRIMARY KEY(`id`)
);
