# Track Sharing & Social Engagement Features

## Overview
This update adds comprehensive track sharing functionality that allows users to share tracks they're listening to on social media platforms, with intelligent platform detection based on their login method, rewards system integration, and analytics.

## Key Features

### 1. **Interactive Track Sharing**
- Users can share tracks directly from the "Now Playing" section
- Share buttons appear on current track and track history
- Multiple variants: compact, default, and expanded views
- One-click sharing to multiple platforms

### 2. **Smart Platform Detection**
- Automatically detects user's logged-in social network (Twitter, Facebook, Instagram, etc.)
- Prioritizes share buttons based on user's login method
- Highlights the user's primary platform with special styling
- Falls back gracefully for non-authenticated users

### 3. **Rewards System Integration**
- Users earn **10 coins** for each track share
- Coins are automatically added to user's wallet
- Real-time coin balance updates
- Share statistics tracked per user

### 4. **Share Analytics & Leaderboard**
- Track-level analytics showing total shares
- Platform breakdown (which platforms are most popular)
- Top sharers leaderboard
- User-specific share statistics
- Visual charts and progress bars

### 5. **Social Media Platforms Supported**
- X (Twitter)
- Facebook
- Instagram
- WhatsApp
- Telegram
- Spotify (future)
- Mixcloud (future)

## Database Schema

### New Table: `track_shares`
```sql
- id: Primary key
- trackId: Foreign key to tracks table
- userId: Foreign key to users table (optional)
- userName: Name if not logged in
- platform: Social media platform
- shareUrl: URL where it was shared
- shareText: The text that was shared
- isVerified: Whether share was verified
- coinsEarned: Coins earned for sharing
- createdAt: Timestamp
```

## API Endpoints

### `trackShares.create`
Creates a new track share record and awards coins.

**Input:**
- trackId (required)
- userId (optional, from auth context)
- userName (optional)
- platform (required)
- shareUrl (optional)
- shareText (optional)
- isVerified (default: false)

**Returns:** Track share object with coins earned

### `trackShares.list`
Lists track shares with optional filtering.

**Input:**
- trackId (optional)
- userId (optional)
- limit (default: 50)

**Returns:** Array of track shares

### `trackShares.stats`
Get aggregate statistics for track shares.

**Input:**
- trackId (optional, if not provided returns global stats)

**Returns:**
- totalShares
- sharesByPlatform
- topSharers

### `trackShares.myStats`
Get current user's share statistics (protected).

**Returns:**
- totalShares
- totalCoinsEarned
- sharesByPlatform

## Components

### `TrackShareButton`
Main component for sharing tracks.

**Props:**
- `trackId`: Track ID to share
- `title`: Track title
- `artist`: Track artist
- `variant`: "compact" | "default" | "expanded"
- `className`: Additional CSS classes

**Features:**
- Platform detection based on user login
- Automatic share text generation
- Coin rewards notification
- Real-time stats display

### `TrackShareLeaderboard`
Analytics and leaderboard component.

**Props:**
- `trackId`: Optional track ID (if not provided, shows global stats)
- `limit`: Number of top sharers to show (default: 10)
- `className`: Additional CSS classes

**Features:**
- Share statistics overview
- Top sharers leaderboard with rankings
- Platform breakdown with percentages
- Visual progress bars

## Integration Points

### NowPlaying Component
- Share button added to current track
- Share buttons on track history (hover to reveal)
- Compact variant for space efficiency

### Home Page
- Expanded share component shown when track is playing
- Full analytics and leaderboard available

## User Experience Flow

1. **User listens to track** → Track appears in "Now Playing"
2. **User clicks share button** → Platform selection menu appears
3. **User selects platform** → Share URL opens in new tab
4. **Share is recorded** → User earns 10 coins
5. **Success notification** → Toast shows coins earned
6. **Stats update** → Leaderboard and analytics refresh

## Future Enhancements

- [ ] Share verification via API (verify actual shares on platforms)
- [ ] Share templates customization
- [ ] Share scheduling
- [ ] Share analytics dashboard for admins
- [ ] Share rewards tiers (more coins for verified shares)
- [ ] Social media API integrations for auto-posting
- [ ] Share contests and challenges
- [ ] Share streaks and achievements

## Migration Notes

To apply the database changes:

1. Run database migration:
   ```bash
   pnpm db:push
   ```

2. The new `track_shares` table will be created automatically.

3. Existing functionality remains unchanged - this is a purely additive feature.

## Testing

Test the feature by:
1. Logging in with different social platforms
2. Playing a track (or viewing track history)
3. Clicking share buttons
4. Verifying coins are awarded
5. Checking leaderboard updates
6. Viewing analytics

## Performance Considerations

- Share queries are optimized with indexes on trackId and userId
- Stats are cached and refreshed on share creation
- Leaderboard limits prevent excessive data loading
- Real-time updates use React Query invalidation
