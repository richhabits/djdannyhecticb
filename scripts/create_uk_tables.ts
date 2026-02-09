
import 'dotenv/config';
import { getDb } from '../server/db';
import { sql } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  if (!db) {
    console.error('Failed to connect to database');
    process.exit(1);
  }

  console.log('Creating UK Events tables...');

  try {
    // promoter_profiles
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS promoter_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        name VARCHAR(255) NOT NULL,
        companyName VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        website VARCHAR(512),
        instagramHandle VARCHAR(100),
        twitterHandle VARCHAR(100),
        facebookUrl VARCHAR(512),
        isVerified TINYINT(1) NOT NULL DEFAULT 0,
        verifiedAt TIMESTAMP NULL,
        verificationNotes TEXT,
        totalEventsSubmitted INT NOT NULL DEFAULT 0,
        approvedEventsCount INT NOT NULL DEFAULT 0,
        bio TEXT,
        logoUrl VARCHAR(512),
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Created promoter_profiles table');

    // user_event_submissions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_event_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        submitterName VARCHAR(255) NOT NULL,
        submitterEmail VARCHAR(255) NOT NULL,
        submitterPhone VARCHAR(20),
        isPromoter TINYINT(1) NOT NULL DEFAULT 0,
        promoterId INT,
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        category ENUM('music', 'festival', 'boxing', 'sports', 'comedy', 'theatre', 'clubbing', 'other') NOT NULL,
        subcategory VARCHAR(100),
        genre VARCHAR(100),
        venueName VARCHAR(255) NOT NULL,
        venueAddress VARCHAR(500),
        city VARCHAR(100) NOT NULL,
        postcode VARCHAR(20),
        eventDate TIMESTAMP NOT NULL,
        eventEndDate TIMESTAMP NULL,
        doorsTime VARCHAR(10),
        imageUrl VARCHAR(512),
        ticketUrl VARCHAR(512),
        priceMin VARCHAR(50),
        priceMax VARCHAR(50),
        artists TEXT,
        ageRestriction VARCHAR(50),
        additionalNotes TEXT,
        status ENUM('pending', 'approved', 'rejected', 'needs_info') NOT NULL DEFAULT 'pending',
        reviewedBy INT,
        reviewedAt TIMESTAMP NULL,
        rejectionReason TEXT,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Created user_event_submissions table');

    // event_recommendations
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS event_recommendations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        eventId INT NOT NULL,
        userId INT,
        recommenderName VARCHAR(255),
        recommenderEmail VARCHAR(255),
        reason TEXT NOT NULL,
        upvotes INT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Created event_recommendations table');

  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }

  console.log('Done!');
  process.exit(0);
}

main();
