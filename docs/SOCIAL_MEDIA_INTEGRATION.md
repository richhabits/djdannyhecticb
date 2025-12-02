# Social Media Integration System

## Overview

The Social Media Integration System enables users to connect their social media accounts and automatically share tracks they're listening to on Hectic Radio. The system rewards users with HecticCoins for sharing, creating a viral loop that promotes the station across multiple platforms.

## Features

### 1. **Social Account Connections**
Users can connect multiple social media accounts:
- Twitter/X
- Instagram
- TikTok
- Facebook
- Spotify (listening status)
- YouTube
- Snapchat
- Telegram

**OAuth Flow:**
1. User clicks "Connect" on a platform
2. System redirects to platform's OAuth page
3. User authorizes the app
4. Access token is stored (encrypted)
5. User can enable/disable auto-sharing per platform

### 2. **Smart Track Sharing**
When users share a track, the system:
- Uses platform-specific templates
- Customizes content based on character limits
- Auto-posts if account is connected
- Tracks engagement metrics
- Awards HecticCoins based on configuration

**Share Types:**
- `nowPlaying` - Currently listening track
- `trackRequest` - Requested tracks
- `mix` - Full DJ mixes
- `episode` - Show episodes
- `manual` - Manual shares

### 3. **Platform-Specific Content**

Each platform has optimized templates:

**Twitter/X:**
```
🔥 Vibing to "{track}" by {artist} on Hectic Radio! 🎧

Tune in now 👉 https://hecticradio.com/live

#HecticRadio #NowPlaying #DJDannyHecticB
```

**Instagram:**
```
🎵 Now Playing: {track} by {artist}

🔊 Lock in with Hectic Radio

#HecticRadio #NowPlaying #DJ #MusicLovers
```

**TikTok:**
```
{track} - {artist} 🎵

Live on Hectic Radio 🔥

#HecticRadio #Music #DJ
```

### 4. **Reward System**

Users earn HecticCoins for sharing:

**Default Configuration:**
- Twitter: 10 coins per share
- Instagram: 15 coins per share
- TikTok: 20 coins per share
- Facebook: 10 coins per share
- WhatsApp: 5 coins per share
- Telegram: 5 coins per share

**Rate Limits:**
- Max 10 shares per day per platform
- 30-minute cooldown between shares
- Prevents spam and abuse

**Engagement Bonuses:**
- Extra coins for likes/comments/shares
- Configurable multiplier (default: 0.1 coins per engagement)

### 5. **Live Share Feed**

Real-time feed showing:
- Who's sharing tracks
- Which platforms
- Coins earned
- Track details
- Timestamps

Updates every 30 seconds for a truly live feel.

### 6. **Analytics Dashboard**

Users can view:
- Total shares across all platforms
- Total coins earned from sharing
- Platform breakdown
- Most shared track
- Recent share history

Admins can see platform-wide analytics:
- Top shared tracks
- Most active platforms
- Engagement trends
- Coin distribution

## Database Schema

### `user_social_connections`
Stores OAuth connections:
- `userId` - FK to users
- `platform` - Social platform
- `accessToken` - Encrypted OAuth token
- `refreshToken` - Encrypted refresh token
- `autoShareEnabled` - Auto-post on now playing

### `track_shares`
Records every share:
- `userId` - Who shared
- `trackId` - What was shared
- `platform` - Where it was shared
- `shareType` - Type of share
- `postId` - Social platform post ID
- `coinsEarned` - Rewards earned

### `social_share_templates`
Platform-specific templates:
- `platform` - Target platform
- `shareType` - Type of content
- `templateText` - Message template with placeholders
- `hashtags` - Platform-appropriate hashtags

### `share_rewards_config`
Configurable reward settings:
- `platform` - Social platform
- `shareType` - Type of share
- `coinsPerShare` - Base reward
- `maxSharesPerDay` - Daily limit
- `cooldownMinutes` - Time between shares

## API Endpoints

### User Endpoints

**Get My Connections**
```typescript
trpc.socialMedia.connections.myConnections.useQuery()
```

**Get Auth URL**
```typescript
trpc.socialMedia.connections.getAuthUrl.useQuery({ platform: "twitter" })
```

**Disconnect Account**
```typescript
trpc.socialMedia.connections.disconnect.useMutation({ connectionId: 123 })
```

**Toggle Auto-Share**
```typescript
trpc.socialMedia.connections.toggleAutoShare.useMutation({
  platform: "twitter",
  enabled: true
})
```

**Share Track**
```typescript
trpc.socialMedia.sharing.shareTrack.useMutation({
  trackTitle: "Track Name",
  trackArtist: "Artist Name",
  platform: "twitter",
  shareType: "nowPlaying",
  customMessage: "Custom message (optional)"
})
```

**My Share Stats**
```typescript
trpc.socialMedia.sharing.myShareStats.useQuery()
```

**Recent Shares Feed**
```typescript
trpc.socialMedia.sharing.recentShares.useQuery({ limit: 20 })
```

**Top Shared Tracks**
```typescript
trpc.socialMedia.sharing.topSharedTracks.useQuery({ days: 7, limit: 10 })
```

### Admin Endpoints

**Create Share Template**
```typescript
trpc.socialMedia.templates.adminCreate.useMutation({
  name: "Twitter Now Playing",
  platform: "twitter",
  shareType: "nowPlaying",
  templateText: "🔥 {track} by {artist}",
  hashtags: ["HecticRadio", "NowPlaying"],
  priority: 10
})
```

**Create Reward Config**
```typescript
trpc.socialMedia.rewardConfig.create.useMutation({
  platform: "twitter",
  shareType: "nowPlaying",
  coinsPerShare: 10,
  maxSharesPerDay: 10,
  cooldownMinutes: 30
})
```

## Environment Variables

Required OAuth credentials:

```env
# Twitter/X
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret

# Instagram
INSTAGRAM_CLIENT_ID=your_app_id
INSTAGRAM_CLIENT_SECRET=your_app_secret

# TikTok
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret

# Facebook
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret

# Spotify
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# Google (YouTube)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Snapchat
SNAPCHAT_CLIENT_ID=your_client_id
SNAPCHAT_CLIENT_SECRET=your_client_secret

# App URL for OAuth callbacks
APP_URL=https://your-domain.com
```

## Setup Instructions

### 1. Configure OAuth Apps

For each platform, create an OAuth app and add the callback URL:
```
https://your-domain.com/api/social/callback/{platform}
```

### 2. Set Environment Variables

Add the OAuth credentials to your `.env` file.

### 3. Run Database Migration

```bash
pnpm db:push
```

### 4. Seed Default Templates

Use the admin panel or API to create default share templates for each platform.

### 5. Configure Rewards

Set up reward configs for each platform/share type combination.

## Frontend Components

### `<SocialConnections />`
Displays all social platforms with connect/disconnect buttons and auto-share toggles.

### `<EnhancedSocialShare />`
Unified share component with platform selection, custom messages, and coin display.

Props:
- `trackTitle` - Track name
- `trackArtist` - Artist name
- `trackId` - Track ID (optional)
- `shareType` - Type of share
- `variant` - Display style (full/compact/button)

### `<LiveShareFeed />`
Real-time feed of recent shares from all users.

### `<TopSharedTracks />`
Leaderboard of most shared tracks.

### `<SocialAnalytics />`
User dashboard showing their sharing stats and rewards.

## Integration with Now Playing

The `NowPlaying` component now includes the enhanced share bar, allowing users to instantly share what they're listening to with one click.

## Security Considerations

1. **Token Encryption**: OAuth tokens are encrypted at rest
2. **Rate Limiting**: Prevents abuse with daily limits and cooldowns
3. **Scopes**: Only requests necessary permissions
4. **Token Refresh**: Automatically refreshes expired tokens
5. **User Control**: Users can disconnect anytime

## Future Enhancements

1. **Instagram Stories**: Auto-post to stories with track stickers
2. **TikTok Integration**: Create short clips with track audio
3. **Engagement Sync**: Pull likes/comments/shares from platforms
4. **Leaderboards**: Global rankings of top sharers
5. **Challenges**: Time-limited sharing challenges with bonus rewards
6. **Referral Bonuses**: Extra coins for sharing with friend referral links
7. **Platform Analytics**: Deep insights per platform
8. **Content Calendar**: Schedule shares in advance
9. **A/B Testing**: Test different templates for optimal engagement
10. **Webhooks**: Real-time notifications for shares and engagement

## Monetization Opportunities

1. **Premium Features**: Advanced analytics, more shares, priority posting
2. **Sponsored Shares**: Brands pay for promoted content
3. **Affiliate Links**: Track links in shares for commission
4. **Data Insights**: Sell aggregated (anonymous) engagement data
5. **White Label**: License system to other radio stations

## Support

For OAuth setup issues, check platform-specific documentation:
- [Twitter OAuth 2.0](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [TikTok Login Kit](https://developers.tiktok.com/doc/login-kit-web)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login)
- [Spotify Authorization](https://developer.spotify.com/documentation/web-api/concepts/authorization)
- [YouTube API](https://developers.google.com/youtube/v3)

For technical support, contact the dev team or check the logs in `/admin/empire`.
