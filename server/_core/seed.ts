/**
 * Database Seed Script
 * Run with: tsx server/_core/seed.ts
 */

import { getDb } from '../db';
import {
  brands,
  empireSettings,
  rewards,
  collectibles,
  achievements,
  showsPhase9,
  mixes,
  streamingLinks,
  streams,
} from '../../drizzle/schema';

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error('Database not configured. Please set DATABASE_URL in .env');
    process.exit(1);
  }

  console.log('🌱 Starting database seed...\n');

  try {
    // 1. Seed Brands
    console.log('📦 Seeding brands...');
    await db.insert(brands).values([
      {
        name: 'DJ Danny Hectic B',
        slug: 'dj-danny-hectic-b',
        type: 'personality',
        archetype: 'dj',
        primaryColor: '#ff6b35',
        secondaryColor: '#f7931e',
        logoUrl: '/logo-icon.png',
        isActive: true,
        isDefault: true,
      },
      {
        name: 'Hectic Radio',
        slug: 'hectic-radio',
        type: 'station',
        archetype: 'station',
        primaryColor: '#ff6b35',
        secondaryColor: '#1a1a1a',
        isActive: true,
        isDefault: false,
      },
    ]).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

    // 2. Seed Empire Settings
    console.log('⚙️ Seeding empire settings...');
    await db.insert(empireSettings).values([
      {
        key: 'ai_posting_enabled',
        value: 'true',
        description: 'Enable AI-powered social media posting',
      },
      {
        key: 'ai_hosting_enabled',
        value: 'true',
        description: 'Enable AI show hosting features',
      },
      {
        key: 'fan_facing_ai_tools_enabled',
        value: 'true',
        description: 'Enable fan-facing AI tools (voice drops, scripts)',
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        description: 'Enable maintenance mode (disables all features)',
      },
      {
        key: 'booking_requests_enabled',
        value: 'true',
        description: 'Enable booking request submissions',
      },
    ]).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

    // 3. Seed Rewards Catalogue
    console.log('🎁 Seeding rewards catalogue...');
    await db.insert(rewards).values([
      {
        name: 'Exclusive Mix Download',
        description: 'Download an exclusive unreleased mix',
        costCoins: 500,
        type: 'digital',
        fulfillmentType: 'autoEmail',
        isActive: true,
      },
      {
        name: 'Personalized AI Shoutout',
        description: 'Get a custom AI-generated voice shoutout from Danny',
        costCoins: 750,
        type: 'aiAsset',
        fulfillmentType: 'aiVoice',
        isActive: true,
      },
      {
        name: 'Custom DJ Drop',
        description: 'AI-generated custom DJ drop with your name',
        costCoins: 1000,
        type: 'aiAsset',
        fulfillmentType: 'aiVoice',
        isActive: true,
      },
      {
        name: 'Show Co-Host Spot',
        description: 'Co-host a live show with Danny',
        costCoins: 5000,
        type: 'access',
        fulfillmentType: 'manual',
        isActive: true,
      },
      {
        name: 'VIP Inner Circle Access',
        description: '1 month Inner Circle membership',
        costCoins: 2500,
        type: 'access',
        fulfillmentType: 'manual',
        isActive: true,
      },
    ]).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

    // 4. Seed Collectibles
    console.log('🏆 Seeding collectibles...');
    await db.insert(collectibles).values([
      {
        name: 'Day One Badge',
        description: 'First listener badge',
        type: 'badge',
        rarity: 'common',
        imageUrl: '/badges/day-one.png',
        isActive: true,
      },
      {
        name: 'Hectic Regular',
        description: 'Regular listener badge',
        type: 'badge',
        rarity: 'common',
        imageUrl: '/badges/regular.png',
        isActive: true,
      },
      {
        name: 'Hectic Royalty',
        description: 'VIP listener badge',
        type: 'badge',
        rarity: 'rare',
        imageUrl: '/badges/royalty.png',
        isActive: true,
      },
      {
        name: 'Inner Circle Member',
        description: 'Exclusive inner circle badge',
        type: 'badge',
        rarity: 'legendary',
        imageUrl: '/badges/inner-circle.png',
        isActive: true,
      },
      {
        name: 'Track Hunter Trophy',
        description: 'Requested 10+ tracks',
        type: 'trophy',
        rarity: 'rare',
        imageUrl: '/trophies/track-hunter.png',
        isActive: true,
      },
    ]).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

    // 5. Seed Achievements
    console.log('🎖️ Seeding achievements...');
    await db.insert(achievements).values([
      {
        name: 'First Shout',
        description: 'Send your first shout to the radio',
        iconUrl: '/icons/first-shout.png',
        pointsReward: 50,
        rarity: 'common',
        criteria: JSON.stringify({ type: 'shout_count', value: 1 }),
        isActive: true,
      },
      {
        name: 'Track Requester',
        description: 'Request your first track',
        iconUrl: '/icons/track-request.png',
        pointsReward: 100,
        rarity: 'common',
        criteria: JSON.stringify({ type: 'track_request_count', value: 1 }),
        isActive: true,
      },
      {
        name: '7 Day Streak',
        description: 'Listen for 7 consecutive days',
        iconUrl: '/icons/streak-7.png',
        pointsReward: 500,
        rarity: 'rare',
        criteria: JSON.stringify({ type: 'streak_days', value: 7 }),
        isActive: true,
      },
      {
        name: 'Super Fan',
        description: 'Earn 10,000 Hectic Coins',
        iconUrl: '/icons/super-fan.png',
        pointsReward: 1000,
        rarity: 'epic',
        criteria: JSON.stringify({ type: 'total_coins', value: 10000 }),
        isActive: true,
      },
      {
        name: 'Inner Circle',
        description: 'Join the exclusive Inner Circle',
        iconUrl: '/icons/inner-circle.png',
        pointsReward: 5000,
        rarity: 'legendary',
        criteria: JSON.stringify({ type: 'inner_circle', value: true }),
        isActive: true,
      },
    ]).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

    // 6. Seed Primary Show
    console.log('📻 Seeding shows...');
    await db.insert(showsPhase9).values([
      {
        name: 'The Hectic Show',
        slug: 'the-hectic-show',
        description: 'The flagship Hectic Radio show with DJ Danny Hectic B',
        hostName: 'DJ Danny Hectic B',
        isPrimaryShow: true,
        isActive: true,
      },
    ]).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

    // 7. Seed Sample Mixes
    console.log('🎵 Seeding sample mixes...');
    await db.insert(mixes).values([
      {
        title: 'UK Garage Classics Vol. 1',
        description: 'The best UK Garage tracks from the golden era',
        audioUrl: 'https://example.com/mixes/uk-garage-1.mp3',
        coverImageUrl: '/covers/uk-garage-1.jpg',
        duration: 3600,
        genre: 'UK Garage',
        isFree: true,
      },
      {
        title: 'Soulful House Sessions',
        description: 'Smooth soulful house vibes for late night listening',
        audioUrl: 'https://example.com/mixes/soulful-house.mp3',
        coverImageUrl: '/covers/soulful-house.jpg',
        duration: 4200,
        genre: 'Soulful House',
        isFree: true,
      },
      {
        title: 'Amapiano Heat',
        description: 'The hottest Amapiano tracks from South Africa',
        audioUrl: 'https://example.com/mixes/amapiano.mp3',
        coverImageUrl: '/covers/amapiano.jpg',
        duration: 3000,
        genre: 'Amapiano',
        isFree: false,
        downloadUrl: 'https://example.com/downloads/amapiano.zip',
      },
    ]).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

    // 8. Seed Streaming Links
    console.log('🔗 Seeding streaming links...');
    await db.insert(streamingLinks).values([
      {
        platform: 'spotify',
        url: 'https://open.spotify.com/user/djdannyhecticb',
        displayName: 'Spotify',
        icon: 'spotify',
        order: 1,
      },
      {
        platform: 'soundcloud',
        url: 'https://soundcloud.com/djdannyhecticb',
        displayName: 'SoundCloud',
        icon: 'soundcloud',
        order: 2,
      },
      {
        platform: 'mixcloud',
        url: 'https://mixcloud.com/djdannyhecticb',
        displayName: 'Mixcloud',
        icon: 'mixcloud',
        order: 3,
      },
      {
        platform: 'apple-music',
        url: 'https://music.apple.com/artist/djdannyhecticb',
        displayName: 'Apple Music',
        icon: 'apple',
        order: 4,
      },
    ]).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

    // 9. Seed Default Stream
    console.log('📡 Seeding default stream...');
    await db.insert(streams).values([
      {
        name: 'Hectic Radio Main Stream',
        type: 'custom',
        publicUrl: 'https://stream.hecticradio.com/live',
        isActive: true,
      },
    ]).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

    console.log('\n✅ Database seed completed successfully!\n');
    console.log('📊 Seeded:');
    console.log('  - 2 brands');
    console.log('  - 5 empire settings');
    console.log('  - 5 rewards');
    console.log('  - 5 collectibles');
    console.log('  - 5 achievements');
    console.log('  - 1 show');
    console.log('  - 3 mixes');
    console.log('  - 4 streaming links');
    console.log('  - 1 stream\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seed();
