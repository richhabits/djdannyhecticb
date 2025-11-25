CREATE TABLE `bookingSlots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slotStart` timestamp NOT NULL,
	`slotEnd` timestamp NOT NULL,
	`status` enum('available','held','booked') NOT NULL DEFAULT 'available',
	`holdExpiresAt` timestamp,
	`bookingId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookingSlots_id` PRIMARY KEY(`id`)
);
