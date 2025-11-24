CREATE TABLE `socialPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` varchar(64) NOT NULL,
	`platformPostId` varchar(128),
	`authorHandle` varchar(255),
	`authorAvatarUrl` varchar(512),
	`content` text NOT NULL,
	`mediaUrl` varchar(512),
	`permalink` varchar(512),
	`likeCount` int NOT NULL DEFAULT 0,
	`commentCount` int NOT NULL DEFAULT 0,
	`postedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `socialPosts_id` PRIMARY KEY(`id`)
);
