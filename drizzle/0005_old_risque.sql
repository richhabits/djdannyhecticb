CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`category` varchar(100),
	`coverImageUrl` varchar(512),
	`authorId` int,
	`authorName` varchar(255),
	`isPublished` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `media_library` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filename` varchar(255) NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`size` int NOT NULL,
	`url` varchar(512) NOT NULL,
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_library_id` PRIMARY KEY(`id`)
);

CREATE TABLE `music_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`entityType` enum('mix','track','event','podcast') NOT NULL,
	`entityId` int NOT NULL,
	`score` decimal(5,2),
	`reason` text,
	`algorithm` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `music_recommendations_id` PRIMARY KEY(`id`)
);

CREATE TABLE `social_media_feed_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('instagram','tiktok','youtube','twitter','facebook') NOT NULL,
	`postId` varchar(255) NOT NULL,
	`url` varchar(512) NOT NULL,
	`mediaUrl` varchar(512),
	`thumbnailUrl` varchar(512),
	`caption` text,
	`author` varchar(255),
	`authorAvatar` varchar(512),
	`likes` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`postedAt` timestamp NOT NULL,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_media_feed_posts_id` PRIMARY KEY(`id`)
);

CREATE TABLE `social_proof_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('booking','purchase','favorite','share','comment','view') NOT NULL,
	`entityType` enum('mix','track','event','podcast','product','booking') NOT NULL,
	`entityId` int NOT NULL,
	`message` varchar(255),
	`userId` int,
	`userName` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_proof_notifications_id` PRIMARY KEY(`id`)
);

CREATE TABLE `social_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('mix','track','event','podcast','video','blog') NOT NULL,
	`entityId` int NOT NULL,
	`platform` enum('facebook','twitter','instagram','tiktok','youtube','linkedin','whatsapp','other') NOT NULL,
	`userId` int,
	`shareUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_shares_id` PRIMARY KEY(`id`)
);

CREATE TABLE `track_id_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`userName` varchar(255),
	`email` varchar(255),
	`trackDescription` text NOT NULL,
	`audioUrl` varchar(512),
	`timestamp` varchar(100),
	`source` varchar(255),
	`status` enum('pending','identified','not_found','archived') NOT NULL DEFAULT 'pending',
	`identifiedTrack` text,
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `track_id_requests_id` PRIMARY KEY(`id`)
);

CREATE TABLE `user_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entityType` enum('mix','track','event','podcast') NOT NULL,
	`entityId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_favorites_id` PRIMARY KEY(`id`)
);

CREATE TABLE `user_playlist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playlistId` int NOT NULL,
	`entityType` enum('mix','track','event','podcast') NOT NULL,
	`entityId` int NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_playlist_items_id` PRIMARY KEY(`id`)
);

CREATE TABLE `user_playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_playlists_id` PRIMARY KEY(`id`)
);

CREATE TABLE `video_testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(255),
	`event` varchar(255),
	`videoUrl` varchar(512) NOT NULL,
	`thumbnailUrl` varchar(512),
	`transcript` text,
	`rating` int,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`isApproved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `video_testimonials_id` PRIMARY KEY(`id`)
);

CREATE TABLE `videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`youtubeUrl` varchar(512) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`thumbnailUrl` varchar(512),
	`isFeatured` boolean NOT NULL DEFAULT false,
	`views` int NOT NULL DEFAULT 0,
	`duration` varchar(20),
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videos_id` PRIMARY KEY(`id`)
);

ALTER TABLE `purchases` MODIFY COLUMN `status` enum('pending','completed','refunded','failed','cancelled') NOT NULL DEFAULT 'pending';
ALTER TABLE `purchases` ADD `paymentProvider` enum('stripe','paypal','manual');
ALTER TABLE `purchases` ADD `paymentIntentId` varchar(255);
ALTER TABLE `purchases` ADD `paypalOrderId` varchar(255);
ALTER TABLE `purchases` ADD `transactionId` varchar(255);
ALTER TABLE `purchases` ADD `metadata` text;