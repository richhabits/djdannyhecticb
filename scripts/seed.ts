#!/usr/bin/env tsx
/**
 * Enterprise Database Seeding Script
 * Populates database with realistic test data for development and testing
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { 
  users, 
  mixes, 
  bookings, 
  events, 
  podcasts, 
  streamingLinks 
} from '../drizzle/schema';

// Create MySQL connection
const connection = await mysql.createConnection(process.env.DATABASE_URL!);
const db = drizzle(connection);

// Seed configuration
const SEED_CONFIG = {
  users: 100,
  mixes: 50,
  bookings: 200,
  events: 30,
  podcasts: 25,
  testimonials: 50,
  socialPosts: 100,
};

// Helper function to generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate music genres
const MUSIC_GENRES = ['House', 'Garage', 'Soulful House', 'Funky House', 'Grime', 'Amapiano', 'Hip Hop', 'R&B', 'Dancehall', 'Afrobeats'];
const EVENT_TYPES = ['wedding', 'club', 'private', 'corporate', 'radio', 'streaming'];
const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

async function seedUsers() {
  console.log('🌱 Seeding users...');
  
  const usersData = [];
  
  // Create admin user
  usersData.push({
    openId: 'admin-openid',
    name: 'DJ Danny Hectic B',
    email: 'admin@djdannyhectib.com',
    loginMethod: 'email',
    role: 'admin' as const,
    createdAt: new Date('2020-01-01'),
    lastSignedIn: new Date(),
  });
  
  // Create test users
  for (let i = 0; i < SEED_CONFIG.users - 1; i++) {
    usersData.push({
      openId: `user-${faker.string.uuid()}`,
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      loginMethod: faker.helpers.arrayElement(['email', 'google', 'facebook']),
      role: 'user' as const,
      createdAt: randomDate(new Date('2020-01-01'), new Date()),
      lastSignedIn: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
    });
  }
  
  await db.insert(users).values(usersData);
  console.log(`✅ Created ${usersData.length} users`);
}

async function seedMixes() {
  console.log('🌱 Seeding mixes...');
  
  const mixesData = [];
  
  for (let i = 0; i < SEED_CONFIG.mixes; i++) {
    const isFree = Math.random() > 0.3; // 70% free mixes
    
    mixesData.push({
      title: `${faker.helpers.arrayElement(['Summer', 'Winter', 'Spring', 'Autumn', 'Night', 'Day', 'Underground', 'Classic'])} ${faker.helpers.arrayElement(['Vibes', 'Sessions', 'Journey', 'Experience', 'Mix'])} Vol. ${i + 1}`,
      description: faker.lorem.paragraph(),
      audioUrl: `https://storage.djdannyhectib.com/mixes/mix-${i + 1}.mp3`,
      coverImageUrl: `https://picsum.photos/400/400?random=${i}`,
      duration: faker.number.int({ min: 1800, max: 7200 }), // 30 min to 2 hours
      genre: faker.helpers.arrayElement(MUSIC_GENRES),
      isFree,
      downloadUrl: isFree ? `https://storage.djdannyhectib.com/downloads/mix-${i + 1}.mp3` : null,
      createdAt: randomDate(new Date('2020-01-01'), new Date()),
    });
  }
  
  await db.insert(mixes).values(mixesData);
  console.log(`✅ Created ${mixesData.length} mixes`);
}

async function seedBookings() {
  console.log('🌱 Seeding bookings...');
  
  const bookingsData = [];
  const userIds = Array.from({ length: SEED_CONFIG.users }, (_, i) => i + 1);
  
  for (let i = 0; i < SEED_CONFIG.bookings; i++) {
    const eventDate = randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
    const status = eventDate < new Date() ? 'completed' : faker.helpers.arrayElement(BOOKING_STATUSES);
    
    bookingsData.push({
      userId: faker.helpers.arrayElement(userIds),
      eventName: faker.company.name() + ' ' + faker.helpers.arrayElement(['Wedding', 'Birthday Party', 'Corporate Event', 'Club Night', 'Festival', 'Private Party']),
      eventDate,
      eventLocation: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}`,
      eventType: faker.helpers.arrayElement(EVENT_TYPES),
      guestCount: faker.number.int({ min: 50, max: 1000 }),
      budget: `£${faker.number.int({ min: 500, max: 5000 })}`,
      description: faker.lorem.paragraph(),
      contactEmail: faker.internet.email().toLowerCase(),
      contactPhone: faker.phone.number(),
      status: status as any,
      createdAt: randomDate(new Date('2020-01-01'), eventDate),
    });
  }
  
  await db.insert(bookings).values(bookingsData);
  console.log(`✅ Created ${bookingsData.length} bookings`);
}

async function seedEvents() {
  console.log('🌱 Seeding events...');
  
  const eventsData = [];
  
  for (let i = 0; i < SEED_CONFIG.events; i++) {
    const eventDate = randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date(Date.now() + 180 * 24 * 60 * 60 * 1000));
    
    eventsData.push({
      title: faker.helpers.arrayElement(['Summer', 'Winter', 'Spring', 'Autumn']) + ' ' + faker.helpers.arrayElement(['Festival', 'Rave', 'Club Night', 'House Party', 'Warehouse Party']),
      description: faker.lorem.paragraphs(2),
      eventDate,
      location: `${faker.company.name()} ${faker.helpers.arrayElement(['Club', 'Venue', 'Arena', 'Hall'])}, ${faker.location.city()}`,
      imageUrl: `https://picsum.photos/800/400?random=${i}`,
      ticketUrl: faker.internet.url(),
      price: faker.helpers.arrayElement(['Free', `£${faker.number.int({ min: 10, max: 100 })}`]),
      isFeatured: Math.random() > 0.7, // 30% featured
      createdAt: randomDate(new Date('2020-01-01'), eventDate),
    });
  }
  
  await db.insert(events).values(eventsData);
  console.log(`✅ Created ${eventsData.length} events`);
}

async function seedPodcasts() {
  console.log('🌱 Seeding podcasts...');
  
  const podcastsData = [];
  
  for (let i = 0; i < SEED_CONFIG.podcasts; i++) {
    podcastsData.push({
      title: `Episode ${i + 1}: ${faker.lorem.sentence()}`,
      description: faker.lorem.paragraphs(2),
      episodeNumber: i + 1,
      audioUrl: `https://storage.djdannyhectib.com/podcasts/episode-${i + 1}.mp3`,
      coverImageUrl: `https://picsum.photos/400/400?random=${i + 100}`,
      duration: faker.number.int({ min: 1200, max: 5400 }), // 20 min to 1.5 hours
      spotifyUrl: `https://open.spotify.com/episode/${faker.string.alphanumeric(22)}`,
      applePodcastsUrl: `https://podcasts.apple.com/podcast/${faker.string.alphanumeric(10)}`,
      youtubeUrl: `https://youtube.com/watch?v=${faker.string.alphanumeric(11)}`,
      createdAt: randomDate(new Date('2020-01-01'), new Date()),
    });
  }
  
  await db.insert(podcasts).values(podcastsData);
  console.log(`✅ Created ${podcastsData.length} podcasts`);
}

async function seedStreamingLinks() {
  console.log('🌱 Seeding streaming links...');
  
  const platforms = [
    { platform: 'spotify', displayName: 'Spotify', icon: 'spotify', order: 1 },
    { platform: 'apple-music', displayName: 'Apple Music', icon: 'apple', order: 2 },
    { platform: 'soundcloud', displayName: 'SoundCloud', icon: 'soundcloud', order: 3 },
    { platform: 'youtube', displayName: 'YouTube', icon: 'youtube', order: 4 },
    { platform: 'mixcloud', displayName: 'Mixcloud', icon: 'mixcloud', order: 5 },
    { platform: 'beatport', displayName: 'Beatport', icon: 'beatport', order: 6 },
  ];
  
  const linksData = platforms.map(platform => ({
    ...platform,
    url: faker.internet.url(),
    createdAt: new Date('2020-01-01'),
  }));
  
  await db.insert(streamingLinks).values(linksData);
  console.log(`✅ Created ${linksData.length} streaming links`);
}

async function seedAdditionalTables() {
  console.log('🌱 Seeding additional tables...');
  
  // Seed DJ availability
  const availabilityQuery = `
    INSERT INTO dj_availability (date, startTime, endTime, isAvailable, notes)
    VALUES 
  `;
  
  const availabilityValues = [];
  const startDate = new Date();
  for (let i = 0; i < 90; i++) { // Next 90 days
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Weekend availability
    if (date.getDay() === 5 || date.getDay() === 6) {
      availabilityValues.push(`('${dateStr}', '18:00', '02:00', true, 'Weekend availability')`);
    }
    // Weekday limited availability
    else if (date.getDay() !== 0) {
      availabilityValues.push(`('${dateStr}', '19:00', '23:00', true, 'Weekday evening availability')`);
    }
  }
  
  if (availabilityValues.length > 0) {
    await connection.execute(availabilityQuery + availabilityValues.join(','));
    console.log(`✅ Created ${availabilityValues.length} availability slots`);
  }
  
  // Seed service packages
  const packagesQuery = `
    INSERT IGNORE INTO service_packages (name, description, basePrice, duration, setupTime, teardownTime, maxGuests, includes, isActive, displayOrder)
    VALUES 
      ('Wedding Premium', 'Full day wedding DJ service with lighting and MC duties', 1500.00, 480, 120, 60, 250, '["Professional DJ Setup", "Dance Floor Lighting", "MC Services", "First Dance Coordination", "Sound System", "Wireless Microphones", "Online Planning Portal"]', true, 1),
      ('Club Night', '4-hour club DJ set with professional mixing', 500.00, 240, 60, 30, 500, '["Professional DJ Setup", "Club-grade Sound System", "Lighting Sync", "Music Library Access"]', true, 2),
      ('Private Party', 'Birthday parties and private celebrations', 800.00, 300, 60, 30, 100, '["Professional DJ Setup", "Party Lighting", "MC Services", "Request Management", "Sound System"]', true, 3)
  `;
  
  await connection.execute(packagesQuery);
  console.log('✅ Created service packages');
  
  // Seed testimonials
  const testimonialsQuery = `
    CREATE TABLE IF NOT EXISTS testimonials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255),
      company VARCHAR(255),
      content TEXT NOT NULL,
      rating INT DEFAULT 5,
      imageUrl VARCHAR(512),
      videoUrl VARCHAR(512),
      isPublished BOOLEAN DEFAULT true,
      isFeatured BOOLEAN DEFAULT false,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await connection.execute(testimonialsQuery);
  
  const testimonialValues = [];
  for (let i = 0; i < SEED_CONFIG.testimonials; i++) {
    const name = faker.person.fullName();
    const role = faker.person.jobTitle();
    const company = faker.company.name();
    const content = faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 }));
    const rating = faker.number.int({ min: 4, max: 5 });
    const imageUrl = `https://i.pravatar.cc/150?img=${i}`;
    const videoUrl = Math.random() > 0.8 ? faker.internet.url() : null;
    const isFeatured = Math.random() > 0.8;
    
    testimonialValues.push(`('${name}', '${role}', '${company}', '${content}', ${rating}, '${imageUrl}', ${videoUrl ? `'${videoUrl}'` : 'NULL'}, true, ${isFeatured})`);
  }
  
  if (testimonialValues.length > 0) {
    await connection.execute(`
      INSERT INTO testimonials (name, role, company, content, rating, imageUrl, videoUrl, isPublished, isFeatured)
      VALUES ${testimonialValues.join(',')}
    `);
    console.log(`✅ Created ${testimonialValues.length} testimonials`);
  }
}

async function seedAnalytics() {
  console.log('🌱 Seeding analytics data...');
  
  // Create analytics tables
  const analyticsTableQuery = `
    CREATE TABLE IF NOT EXISTS podcast_analytics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      episodeId VARCHAR(255),
      userId INT,
      event VARCHAR(50),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSON,
      INDEX idx_episode (episodeId),
      INDEX idx_user (userId),
      INDEX idx_event (event),
      INDEX idx_timestamp (timestamp)
    )
  `;
  
  await connection.execute(analyticsTableQuery);
  
  const userProgressTableQuery = `
    CREATE TABLE IF NOT EXISTS user_podcast_progress (
      userId INT NOT NULL,
      episodeId VARCHAR(255) NOT NULL,
      progress INT DEFAULT 0,
      currentTime INT DEFAULT 0,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (userId, episodeId),
      INDEX idx_updated (updatedAt)
    )
  `;
  
  await connection.execute(userProgressTableQuery);
  
  // Generate analytics data
  const userIds = Array.from({ length: SEED_CONFIG.users }, (_, i) => i + 1);
  const episodeIds = Array.from({ length: SEED_CONFIG.podcasts }, (_, i) => (i + 1).toString());
  
  // Generate play events
  for (let i = 0; i < 1000; i++) {
    const userId = faker.helpers.arrayElement(userIds);
    const episodeId = faker.helpers.arrayElement(episodeIds);
    const timestamp = randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());
    
    await connection.execute(`
      INSERT INTO podcast_analytics (episodeId, userId, event, timestamp, metadata)
      VALUES (?, ?, 'play', ?, '{}')
    `, [episodeId, userId, timestamp]);
    
    // Add progress events
    if (Math.random() > 0.3) {
      const progress = faker.number.int({ min: 10, max: 100 });
      await connection.execute(`
        INSERT INTO user_podcast_progress (userId, episodeId, progress, currentTime)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE progress = VALUES(progress), currentTime = VALUES(currentTime)
      `, [userId, episodeId, progress, progress * 30]);
      
      // Add completion event if progress is high
      if (progress > 90) {
        await connection.execute(`
          INSERT INTO podcast_analytics (episodeId, userId, event, timestamp, metadata)
          VALUES (?, ?, 'complete', ?, '{}')
        `, [episodeId, userId, timestamp]);
      }
    }
  }
  
  console.log('✅ Created analytics data');
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...');
    console.log(`📊 Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]}`);
    
    // Clear existing data (optional - comment out in production)
    if (process.argv.includes('--fresh')) {
      console.log('⚠️  Clearing existing data...');
      await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
      await connection.execute('TRUNCATE TABLE streaming_links');
      await connection.execute('TRUNCATE TABLE podcasts');
      await connection.execute('TRUNCATE TABLE events');
      await connection.execute('TRUNCATE TABLE bookings');
      await connection.execute('TRUNCATE TABLE mixes');
      await connection.execute('TRUNCATE TABLE users');
      await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
      console.log('✅ Cleared existing data');
    }
    
    // Run seeders in order (respecting foreign key constraints)
    await seedUsers();
    await seedMixes();
    await seedBookings();
    await seedEvents();
    await seedPodcasts();
    await seedStreamingLinks();
    await seedAdditionalTables();
    await seedAnalytics();
    
    console.log('✨ Database seeding completed successfully!');
    
    // Print summary
    const [[userCount]] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [[mixCount]] = await connection.execute('SELECT COUNT(*) as count FROM mixes');
    const [[bookingCount]] = await connection.execute('SELECT COUNT(*) as count FROM bookings');
    const [[eventCount]] = await connection.execute('SELECT COUNT(*) as count FROM events');
    const [[podcastCount]] = await connection.execute('SELECT COUNT(*) as count FROM podcasts');
    
    console.log('\n📈 Database Summary:');
    console.log(`   Users: ${(userCount as any).count}`);
    console.log(`   Mixes: ${(mixCount as any).count}`);
    console.log(`   Bookings: ${(bookingCount as any).count}`);
    console.log(`   Events: ${(eventCount as any).count}`);
    console.log(`   Podcasts: ${(podcastCount as any).count}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the seeder
main();