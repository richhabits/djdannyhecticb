CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`iconUrl` varchar(512),
	`pointsReward` int NOT NULL DEFAULT 0,
	`rarity` enum('common','rare','epic','legendary') NOT NULL DEFAULT 'common',
	`criteria` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_danny_chats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int,
	`sessionId` varchar(64) NOT NULL,
	`message` text NOT NULL,
	`response` text,
	`context` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_danny_chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_mixes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`mood` varchar(100) NOT NULL,
	`bpm` int,
	`genres` text NOT NULL,
	`setlist` text NOT NULL,
	`narrative` text,
	`title` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_mixes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_script_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('intro','outro','mixStory','tiktokClip','promo','fanShout','generic') NOT NULL,
	`inputContext` text,
	`requestedByUserId` int,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`resultText` text,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_script_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_video_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scriptJobId` int,
	`stylePreset` enum('verticalShort','squareClip','horizontalHost') NOT NULL,
	`requestedByUserId` int,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`videoUrl` varchar(512),
	`thumbnailUrl` varchar(512),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_video_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_voice_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scriptJobId` int,
	`rawText` text,
	`voiceProfile` varchar(100) NOT NULL DEFAULT 'hectic_main',
	`requestedByUserId` int,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`audioUrl` varchar(512),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_voice_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`label` varchar(255) NOT NULL,
	`scopes` text,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int,
	`actorName` varchar(255),
	`action` varchar(100) NOT NULL,
	`entityType` varchar(100),
	`entityId` int,
	`beforeSnapshot` text,
	`afterSnapshot` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`description` text,
	`dataBlob` text,
	`checksum` varchar(64),
	`sizeBytes` int,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings_phase7` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`org` varchar(255),
	`email` varchar(255) NOT NULL,
	`phone` varchar(20),
	`type` enum('club','radio','private','corporate','podcast','other') NOT NULL,
	`location` varchar(255) NOT NULL,
	`date` varchar(20) NOT NULL,
	`time` varchar(10),
	`budgetMin` varchar(50),
	`budgetMax` varchar(50),
	`source` varchar(255),
	`status` enum('new','reviewing','accepted','declined','completed') NOT NULL DEFAULT 'new',
	`internalNotes` text,
	`brandId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_phase7_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`type` enum('personality','station','clothing','pets','other') NOT NULL,
	`archetype` enum('dj','podcaster','creator','brand','station'),
	`primaryColor` varchar(20),
	`secondaryColor` varchar(20),
	`logoUrl` varchar(512),
	`domain` varchar(255),
	`defaultFeatureFlags` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brands_id` PRIMARY KEY(`id`),
	CONSTRAINT `brands_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `coin_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`walletId` int NOT NULL,
	`amount` int NOT NULL,
	`type` enum('earn','spend','adjust') NOT NULL,
	`source` enum('mission','loginStreak','shout','trackVote','confession','eventAttend','referral','adminAdjust','rewardRedeem') NOT NULL,
	`referenceId` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coin_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collectibles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('badge','nft','trophy','item','skin') NOT NULL,
	`rarity` enum('common','rare','epic','legendary') NOT NULL DEFAULT 'common',
	`imageUrl` varchar(512),
	`metadata` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collectibles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('clip','post','story','short','liveAnnouncement','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetPlatform` enum('instagram','tiktok','youtube','whatsapp','telegram','multi') NOT NULL,
	`source` enum('episode','liveSession','aiJob','manual') NOT NULL,
	`sourceId` int,
	`status` enum('draft','ready','scheduled','posted','failed') NOT NULL DEFAULT 'draft',
	`scheduledAt` timestamp,
	`postedAt` timestamp,
	`externalUrl` varchar(512),
	`payload` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `danny_reacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`type` enum('video','meme','track') NOT NULL,
	`mediaUrl` varchar(512) NOT NULL,
	`title` varchar(255),
	`aiReaction` text,
	`aiRating` int,
	`status` enum('pending','reacted','published') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `danny_reacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `danny_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` varchar(100) NOT NULL,
	`message` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `danny_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dj_battles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`djName` varchar(255) NOT NULL,
	`djEmail` varchar(255),
	`mixUrl` varchar(512) NOT NULL,
	`mixTitle` varchar(255),
	`aiCritique` text,
	`aiScore` int,
	`aiImprovements` text,
	`status` enum('pending','reviewed','published') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dj_battles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `empire_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` int,
	CONSTRAINT `empire_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `empire_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `error_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`route` varchar(255),
	`method` varchar(10),
	`stackSnippet` text,
	`message` text,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`userId` int,
	`ipAddress` varchar(45),
	`userAgent` text,
	`resolved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `error_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20),
	`organisation` varchar(255),
	`eventType` enum('club','radio','private','brand','other') NOT NULL,
	`eventDate` varchar(20) NOT NULL,
	`eventTime` varchar(10) NOT NULL,
	`location` varchar(255) NOT NULL,
	`budgetRange` varchar(100),
	`setLength` varchar(100),
	`streamingRequired` boolean NOT NULL DEFAULT false,
	`extraNotes` text,
	`marketingConsent` boolean NOT NULL DEFAULT false,
	`dataConsent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events_phase7` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('stream','club','private','online_collab','festival','takeover') NOT NULL,
	`location` varchar(255),
	`dateTimeStart` timestamp NOT NULL,
	`dateTimeEnd` timestamp,
	`isPublic` boolean NOT NULL DEFAULT true,
	`ticketsUrl` varchar(512),
	`status` enum('upcoming','live','completed','cancelled') NOT NULL DEFAULT 'upcoming',
	`brandId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_phase7_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fan_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`tier` enum('rookie','regular','veteran','royalty') NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`onlineTime` int NOT NULL DEFAULT 0,
	`shoutCount` int NOT NULL DEFAULT 0,
	`lastActive` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fan_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feed_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('post','photo','clip','mix') NOT NULL,
	`title` varchar(255),
	`content` text,
	`mediaUrl` varchar(512),
	`thumbnailUrl` varchar(512),
	`aiCaption` text,
	`reactions` text,
	`isPublic` boolean NOT NULL DEFAULT true,
	`isVipOnly` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feed_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerId` int NOT NULL,
	`followingId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `follows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `genz_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`username` varchar(50) NOT NULL,
	`displayName` varchar(255),
	`bio` text,
	`avatarUrl` varchar(512),
	`bannerUrl` varchar(512),
	`location` varchar(255),
	`website` varchar(255),
	`streakDays` int NOT NULL DEFAULT 0,
	`totalPoints` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`followersCount` int NOT NULL DEFAULT 0,
	`followingCount` int NOT NULL DEFAULT 0,
	`isVerified` boolean NOT NULL DEFAULT false,
	`isPublic` boolean NOT NULL DEFAULT true,
	`lastActive` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `genz_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `genz_profiles_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `identity_quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`identityType` varchar(100) NOT NULL,
	`playlist` text,
	`welcomeMessage` text,
	`answers` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `identity_quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incident_banners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message` text NOT NULL,
	`severity` enum('info','warning','error') NOT NULL DEFAULT 'info',
	`isActive` boolean NOT NULL DEFAULT false,
	`startAt` timestamp NOT NULL DEFAULT (now()),
	`endAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `incident_banners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inner_circle` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`isEligible` boolean NOT NULL DEFAULT false,
	`eligibilityReason` varchar(255),
	`unlockedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inner_circle_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listener_locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`city` varchar(255),
	`country` varchar(255),
	`latitude` varchar(20),
	`longitude` varchar(20),
	`fanTier` enum('rookie','regular','veteran','royalty'),
	`lastSeen` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listener_locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyalty_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`totalOnlineTime` int NOT NULL DEFAULT 0,
	`totalShouts` int NOT NULL DEFAULT 0,
	`streakDays` int NOT NULL DEFAULT 0,
	`lastActive` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyalty_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fanId` int,
	`fanName` varchar(255),
	`email` varchar(255),
	`type` varchar(100) NOT NULL,
	`channel` enum('web_push','email','whatsapp','in_app') NOT NULL,
	`payload` text,
	`status` enum('pending','sent','failed','read') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partner_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`brandName` varchar(255),
	`email` varchar(255) NOT NULL,
	`links` text,
	`collabType` enum('guest_mix','co_host','brand_drop','takeover','other') NOT NULL,
	`pitch` text NOT NULL,
	`status` enum('new','reviewing','accepted','declined') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`brandName` varchar(255),
	`logoUrl` varchar(512),
	`links` text,
	`type` enum('venue','clothing','media','dj','creator','other') NOT NULL,
	`notes` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personalized_shoutouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientName` varchar(255) NOT NULL,
	`recipientEmail` varchar(255),
	`type` enum('birthday','roast','motivational','breakup','custom') NOT NULL,
	`message` text NOT NULL,
	`delivered` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `personalized_shoutouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`profileId` int NOT NULL,
	`reactionType` varchar(20) NOT NULL DEFAULT 'like',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`platform` enum('instagram','tiktok','youtube','spotify','mixcloud','snapchat','telegram','piing','twitter','facebook','all') NOT NULL,
	`templateType` enum('nowPlaying','eventAnnouncement','newMix','shoutHighlight','quote','clipDrop') NOT NULL,
	`templateText` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `post_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('drop','soundpack','preset','course','bundle','other') NOT NULL,
	`price` varchar(50) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'GBP',
	`downloadUrl` varchar(512),
	`thumbnailUrl` varchar(512),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promo_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('clip','subtitle','thumbnail','post') NOT NULL,
	`sourceType` enum('mix','show','shout','reaction') NOT NULL,
	`sourceId` int,
	`content` text,
	`mediaUrl` varchar(512),
	`thumbnailUrl` varchar(512),
	`status` enum('pending','generated','published') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promo_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('event','mix','clip','show','achievement','milestone') NOT NULL,
	`entityId` int NOT NULL,
	`platforms` text,
	`status` enum('draft','ready','scheduled','sent') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fanId` int,
	`fanName` varchar(255) NOT NULL,
	`email` varchar(255),
	`productId` int NOT NULL,
	`amount` varchar(50) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'GBP',
	`status` enum('pending','completed','refunded') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `redemptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`rewardId` int NOT NULL,
	`status` enum('pending','approved','rejected','fulfilled') NOT NULL DEFAULT 'pending',
	`coinsSpent` int NOT NULL,
	`notesAdmin` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `redemptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referral_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`ownerUserId` int NOT NULL,
	`maxUses` int,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `referral_uses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codeId` int NOT NULL,
	`referredUserId` int NOT NULL,
	`rewardCoins` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_uses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`costCoins` int NOT NULL,
	`type` enum('digital','physical','access','aiAsset','other') NOT NULL,
	`fulfillmentType` enum('manual','autoEmail','autoLink','aiScript','aiVoice','aiVideo') NOT NULL,
	`fulfillmentPayload` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(255),
	`message` text NOT NULL,
	`trackRequest` varchar(255),
	`isTrackRequest` boolean NOT NULL DEFAULT false,
	`trackTitle` varchar(255),
	`trackArtist` varchar(255),
	`votes` int NOT NULL DEFAULT 0,
	`trackStatus` enum('pending','queued','played') DEFAULT 'pending',
	`phone` varchar(20),
	`email` varchar(255),
	`heardFrom` varchar(255),
	`genres` text,
	`whatsappOptIn` boolean NOT NULL DEFAULT false,
	`canReadOnAir` boolean NOT NULL DEFAULT false,
	`approved` boolean NOT NULL DEFAULT false,
	`readOnAir` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `show_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`episodeId` int NOT NULL,
	`type` enum('script','voiceDrop','clip','socialPack') NOT NULL,
	`aiScriptJobId` int,
	`aiVoiceJobId` int,
	`aiVideoJobId` int,
	`externalUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `show_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `show_cues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`liveSessionId` int NOT NULL,
	`type` enum('playTrack','readShout','playConfession','askQuestion','adBreak','topicIntro','callToAction','custom') NOT NULL,
	`payload` text,
	`orderIndex` int NOT NULL DEFAULT 0,
	`status` enum('pending','done','skipped') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `show_cues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `show_episodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`showId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`status` enum('planned','recorded','live','published','archived') NOT NULL DEFAULT 'planned',
	`scheduledAt` timestamp,
	`recordedAt` timestamp,
	`publishedAt` timestamp,
	`recordingUrl` varchar(512),
	`coverImageUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `show_episodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `show_episodes_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `show_live_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`showId` int NOT NULL,
	`episodeId` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`endedAt` timestamp,
	`status` enum('upcoming','live','ended') NOT NULL DEFAULT 'upcoming',
	`concurrentListenersEstimate` int,
	`livePlatform` enum('site','youtube','tiktok','twitch','other') NOT NULL DEFAULT 'site',
	`liveUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `show_live_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `show_segments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`episodeId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('intro','topic','interview','confession','dilemma','shoutBlock','musicBlock','freestyle','rant','outro','other') NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	`notes` text,
	`aiScriptJobId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `show_segments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`host` varchar(255),
	`description` text,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(10) NOT NULL,
	`endTime` varchar(10) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shows_phase9` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`hostName` varchar(255),
	`isPrimaryShow` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shows_phase9_id` PRIMARY KEY(`id`),
	CONSTRAINT `shows_phase9_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `social_integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('instagram','tiktok','youtube','twitch','twitter','facebook','other') NOT NULL,
	`handle` varchar(255),
	`url` varchar(512) NOT NULL,
	`apiKeyName` varchar(255),
	`isPrimary` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('instagram','tiktok','youtube','spotify','mixcloud','snapchat','telegram','piing','twitter','facebook','other') NOT NULL,
	`url` varchar(512) NOT NULL,
	`handle` varchar(255),
	`brandId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `streams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('shoutcast','icecast','custom') NOT NULL,
	`publicUrl` varchar(512) NOT NULL,
	`sourceHost` varchar(255),
	`sourcePort` int,
	`mount` varchar(255),
	`adminApiUrl` varchar(512),
	`adminUser` varchar(255),
	`adminPassword` varchar(255),
	`isActive` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `streams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fanId` int,
	`fanName` varchar(255) NOT NULL,
	`email` varchar(255),
	`tier` enum('hectic_regular','hectic_royalty','inner_circle') NOT NULL,
	`amount` varchar(50) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'GBP',
	`startAt` timestamp NOT NULL DEFAULT (now()),
	`endAt` timestamp,
	`status` enum('active','cancelled','expired') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `superfans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`tier` enum('bronze','silver','gold','platinum') NOT NULL,
	`perks` text,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `superfans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fanId` int,
	`fanName` varchar(255) NOT NULL,
	`email` varchar(255),
	`amount` varchar(50) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'GBP',
	`message` text,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`artist` varchar(255) NOT NULL,
	`note` text,
	`playedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `traffic_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`route` varchar(255),
	`utmSource` varchar(100),
	`utmMedium` varchar(100),
	`utmCampaign` varchar(100),
	`referrer` varchar(512),
	`userAgent` text,
	`ipAddress` varchar(45),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `traffic_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`achievementId` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_collectibles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`collectibleId` int NOT NULL,
	`acquiredAt` timestamp NOT NULL DEFAULT (now()),
	`isEquipped` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_collectibles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_consents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int,
	`userId` int,
	`email` varchar(255),
	`aiContentConsent` boolean NOT NULL DEFAULT false,
	`marketingConsent` boolean NOT NULL DEFAULT false,
	`dataShareConsent` boolean NOT NULL DEFAULT false,
	`lastUpdatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_consents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`type` enum('text','image','video','audio','clip') NOT NULL,
	`content` text,
	`mediaUrl` varchar(512),
	`thumbnailUrl` varchar(512),
	`likesCount` int NOT NULL DEFAULT 0,
	`commentsCount` int NOT NULL DEFAULT 0,
	`sharesCount` int NOT NULL DEFAULT 0,
	`viewsCount` int NOT NULL DEFAULT 0,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`genres` text,
	`personalityTags` text,
	`shoutFrequency` int NOT NULL DEFAULT 0,
	`vibeLevel` int NOT NULL DEFAULT 1,
	`whatsappOptIn` boolean NOT NULL DEFAULT false,
	`aiMemoryEnabled` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balanceCoins` int NOT NULL DEFAULT 0,
	`lifetimeCoinsEarned` int NOT NULL DEFAULT 0,
	`lifetimeCoinsSpent` int NOT NULL DEFAULT 0,
	`lastUpdatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(512) NOT NULL,
	`secret` varchar(255),
	`eventType` enum('newShout','newEpisodePublished','newRedemption','newFollower','other') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `world_avatars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`avatarData` text,
	`positionX` varchar(20) DEFAULT '0',
	`positionY` varchar(20) DEFAULT '0',
	`positionZ` varchar(20) DEFAULT '0',
	`rotation` varchar(20) DEFAULT '0',
	`isOnline` boolean NOT NULL DEFAULT false,
	`lastSeen` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `world_avatars_id` PRIMARY KEY(`id`)
);
