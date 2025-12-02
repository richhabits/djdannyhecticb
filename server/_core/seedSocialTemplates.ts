/**
 * Seed default social media share templates
 * 
 * Run this once to populate the database with starter templates
 */

import * as socialDb from "../socialDb";

export async function seedSocialTemplates() {
  console.log("[Social Templates] Seeding default templates...");

  const templates = [
    // Twitter/X Templates
    {
      name: "Twitter - Now Playing",
      platform: "twitter" as const,
      shareType: "nowPlaying" as const,
      templateText: "🔥 Vibing to \"{track}\" by {artist} on Hectic Radio! 🎧\n\nTune in now 👉",
      hashtags: JSON.stringify(["HecticRadio", "NowPlaying", "DJDannyHecticB"]),
      priority: 10,
    },
    {
      name: "Twitter - Track Request",
      platform: "twitter" as const,
      shareType: "trackRequest" as const,
      templateText: "Just requested \"{track}\" by {artist} on @HecticRadio! 🎵\n\nWhat's your request? Listen live:",
      hashtags: JSON.stringify(["HecticRadio", "TrackRequest", "DJ"]),
      priority: 10,
    },

    // Instagram Templates
    {
      name: "Instagram - Now Playing",
      platform: "instagram" as const,
      shareType: "nowPlaying" as const,
      templateText: "🎵 Now Playing: {track} by {artist}\n\n🔊 Lock in with Hectic Radio\n\n🎧 Live now on hecticradio.com",
      hashtags: JSON.stringify(["HecticRadio", "NowPlaying", "DJ", "MusicLovers", "LiveRadio"]),
      priority: 10,
    },

    // TikTok Templates
    {
      name: "TikTok - Now Playing",
      platform: "tiktok" as const,
      shareType: "nowPlaying" as const,
      templateText: "{track} - {artist} 🎵\n\nLive on Hectic Radio 🔥",
      hashtags: JSON.stringify(["HecticRadio", "Music", "DJ", "LiveMusic"]),
      priority: 10,
    },

    // Facebook Templates
    {
      name: "Facebook - Now Playing",
      platform: "facebook" as const,
      shareType: "nowPlaying" as const,
      templateText: "Currently listening to \"{track}\" by {artist} on Hectic Radio!\n\nJoin me and tune in at hecticradio.com/live",
      hashtags: JSON.stringify(["HecticRadio", "NowPlaying", "LiveRadio"]),
      priority: 10,
    },

    // WhatsApp Template
    {
      name: "WhatsApp - Now Playing",
      platform: "whatsapp" as const,
      shareType: "nowPlaying" as const,
      templateText: "🔥 Check out \"{track}\" by {artist} playing right now on Hectic Radio!\n\nListen: {url}",
      hashtags: JSON.stringify([]),
      priority: 10,
    },

    // Telegram Template
    {
      name: "Telegram - Now Playing",
      platform: "telegram" as const,
      shareType: "nowPlaying" as const,
      templateText: "🎧 Now Playing: {track} by {artist}\n\n📻 Hectic Radio - Live\n\n🔗 {url}",
      hashtags: JSON.stringify([]),
      priority: 10,
    },

    // Generic "All Platforms" Template
    {
      name: "All Platforms - Now Playing",
      platform: "all" as const,
      shareType: "nowPlaying" as const,
      templateText: "🔥 Listening to \"{track}\" by {artist} on Hectic Radio! Tune in: {url}",
      hashtags: JSON.stringify(["HecticRadio", "NowPlaying"]),
      priority: 5,
    },
  ];

  let created = 0;
  for (const template of templates) {
    try {
      await socialDb.createShareTemplate(template);
      created++;
      console.log(`[Social Templates] Created: ${template.name}`);
    } catch (error) {
      console.log(`[Social Templates] Skipped: ${template.name} (may already exist)`);
    }
  }

  console.log(`[Social Templates] Seeded ${created}/${templates.length} templates`);
}

export async function seedShareRewards() {
  console.log("[Share Rewards] Seeding default reward configs...");

  const configs = [
    // Twitter
    {
      platform: "twitter" as const,
      shareType: "nowPlaying" as const,
      coinsPerShare: 10,
      maxSharesPerDay: 10,
      cooldownMinutes: 30,
      bonusForEngagement: true,
      engagementMultiplier: "0.1",
    },
    {
      platform: "twitter" as const,
      shareType: "trackRequest" as const,
      coinsPerShare: 8,
      maxSharesPerDay: 15,
      cooldownMinutes: 20,
      bonusForEngagement: true,
      engagementMultiplier: "0.1",
    },

    // Instagram
    {
      platform: "instagram" as const,
      shareType: "nowPlaying" as const,
      coinsPerShare: 15,
      maxSharesPerDay: 5,
      cooldownMinutes: 60,
      bonusForEngagement: true,
      engagementMultiplier: "0.2",
    },

    // TikTok
    {
      platform: "tiktok" as const,
      shareType: "nowPlaying" as const,
      coinsPerShare: 20,
      maxSharesPerDay: 3,
      cooldownMinutes: 120,
      bonusForEngagement: true,
      engagementMultiplier: "0.5",
    },

    // Facebook
    {
      platform: "facebook" as const,
      shareType: "nowPlaying" as const,
      coinsPerShare: 10,
      maxSharesPerDay: 8,
      cooldownMinutes: 30,
      bonusForEngagement: true,
      engagementMultiplier: "0.1",
    },

    // WhatsApp
    {
      platform: "whatsapp" as const,
      shareType: "nowPlaying" as const,
      coinsPerShare: 5,
      maxSharesPerDay: 20,
      cooldownMinutes: 10,
      bonusForEngagement: false,
      engagementMultiplier: "0",
    },

    // Telegram
    {
      platform: "telegram" as const,
      shareType: "nowPlaying" as const,
      coinsPerShare: 5,
      maxSharesPerDay: 15,
      cooldownMinutes: 15,
      bonusForEngagement: false,
      engagementMultiplier: "0",
    },
  ];

  let created = 0;
  for (const config of configs) {
    try {
      await socialDb.createShareRewardConfig(config);
      created++;
      console.log(`[Share Rewards] Created: ${config.platform} - ${config.shareType}`);
    } catch (error) {
      console.log(
        `[Share Rewards] Skipped: ${config.platform} - ${config.shareType} (may already exist)`
      );
    }
  }

  console.log(`[Share Rewards] Seeded ${created}/${configs.length} configs`);
}

// Run both seed functions
export async function seedSocialData() {
  await seedSocialTemplates();
  await seedShareRewards();
  console.log("[Social Data] Seeding complete!");
}
