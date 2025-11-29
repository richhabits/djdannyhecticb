# The Hectic Show Playbook

## Overview

The Hectic Show system provides a complete workflow for planning, producing, and publishing shows. It includes show definitions, episode management, live session control, and producer tools.

## Core Concepts

### Shows

A **Show** is a series or program (e.g., "The Hectic Show", "Hectic Nights", "Danny's Mix Sessions"). Each show has:
- Name and slug
- Description
- Host name
- Primary show flag (one show can be marked as primary)
- Active status

### Episodes

An **Episode** is a single installment of a show:
- Title and slug (for URLs)
- Description
- Status: `planned`, `recorded`, `live`, `published`, `archived`
- Scheduled/recorded/published dates
- Recording URL (audio/video)
- Cover image

### Segments

**Segments** are parts of an episode:
- Types: intro, topic, interview, confession, dilemma, shoutBlock, musicBlock, freestyle, rant, outro
- Ordered by `orderIndex`
- Can link to AI Studio scripts via `aiScriptJobId`
- Notes for producer reference

### Live Sessions

A **Live Session** represents a live broadcast:
- Status: `upcoming`, `live`, `ended`
- Start/end times
- Platform (site, YouTube, TikTok, Twitch, etc.)
- Live URL
- Can be linked to an episode (becomes an episode after recording)

### Cues

**Cues** are producer instructions during live shows:
- Types: playTrack, readShout, playConfession, askQuestion, adBreak, topicIntro, callToAction, custom
- Status: `pending`, `done`, `skipped`
- Ordered by `orderIndex`
- JSON payload for references (track ID, shout ID, etc.)

## Workflow

### Planning an Episode

1. **Create Episode** (admin):
   - Go to `/admin/episodes` (or via tRPC)
   - Set title, slug, description
   - Status: `planned`
   - Set `scheduledAt` if known

2. **Add Segments**:
   - Create segments in order
   - Link AI scripts for intros/outros if needed
   - Add notes for each segment

3. **Prepare Assets**:
   - Use AI Studio to generate scripts/voice/video
   - Upload cover images
   - Prepare tracks, shouts, confessions

### Going Live

1. **Schedule Live Session** (admin):
   - Go to `/admin/show-live`
   - Create new session
   - Set show, platform, live URL

2. **Start Session**:
   - Click "Start Live" when ready
   - Session status becomes `live`
   - Public can see "ON AIR" badge on `/show`

3. **Use Producer Panel**:
   - Open `/admin/show-live` during broadcast
   - View cues list
   - Mark cues as done/skipped
   - Add new cues on the fly
   - Auto-import shouts to create cues

4. **End Session**:
   - Click "End Live" when done
   - Session status becomes `ended`

### Publishing an Episode

1. **Attach Recording**:
   - Upload recording (audio/video)
   - Set cover image
   - Update episode status to `published`
   - Set `publishedAt` date

2. **Episode Goes Live**:
   - Appears on `/show/episodes`
   - Accessible at `/show/episode/:slug`
   - Embeddable player

## Producer Panel (`/admin/show-live`)

The Producer Panel is your control room during live shows:

### Left Column: Session Info
- Current live session details
- Start time, timer
- Live URL
- Start/End controls

### Middle Column: Cues
- List of all cues for current session
- Status indicators (pending/done/skipped)
- Quick actions: Mark done, Skip
- Add new cue button
- Auto-import shouts button

### Right Column: Producer Notes
- Show segments rundown
- Quick links to AI scripts
- Reference materials

## Integration with AI Studio

### Scripts for Segments
- When creating a segment, link `aiScriptJobId`
- AI Studio can generate intros, outros, rants
- Scripts stored in `aiScriptJobs` table

### Voice/Video for Promos
- Generate voice drops for episode promos
- Create video clips for social media
- Link via `showAssets` table

## Integration with Economy

### Show-Related Rewards
Create rewards that tie into shows:
- "Get your shout guaranteed in the next Hectic Show" (fulfillment: manual, admin adds to cues)
- "Custom AI intro for your name" (fulfillment: aiScript, generates script)
- "Backstage access to live show" (fulfillment: access, manual)

Store show-specific data in `rewards.fulfillmentPayload`:
```json
{
  "showId": 1,
  "episodeId": 5,
  "action": "addToCues"
}
```

## Public Pages

### `/show`
- Hero for primary show
- "ON AIR" badge if live
- Latest episode card
- Link to all episodes

### `/show/episodes`
- Grid of all published episodes
- Filter by show (if multiple)
- Episode cards with title, date, description

### `/show/episode/:slug`
- Full episode page
- Embedded recording player
- Episode description
- Segment list (if available)
- Share buttons

## Database Schema

### `showsPhase9`
- `id`, `name`, `slug`, `description`, `hostName`, `isPrimaryShow`, `isActive`

### `showEpisodes`
- `id`, `showId`, `title`, `slug`, `description`, `status`, `scheduledAt`, `recordedAt`, `publishedAt`, `recordingUrl`, `coverImageUrl`

### `showSegments`
- `id`, `episodeId`, `title`, `type`, `orderIndex`, `notes`, `aiScriptJobId`

### `showLiveSessions`
- `id`, `showId`, `episodeId`, `startedAt`, `endedAt`, `status`, `concurrentListenersEstimate`, `livePlatform`, `liveUrl`

### `showCues`
- `id`, `liveSessionId`, `type`, `payload`, `orderIndex`, `status`

### `showAssets`
- `id`, `episodeId`, `type`, `aiScriptJobId`, `aiVoiceJobId`, `aiVideoJobId`, `externalUrl`

## Best Practices

1. **Plan ahead**: Create episodes and segments before going live
2. **Use cues**: Don't rely on memory during live shows
3. **Link AI assets**: Use AI Studio for consistent intros/outros
4. **Publish promptly**: Attach recordings and publish episodes quickly after live
5. **Track segments**: Use segments to organize episode content
6. **Monitor live**: Keep producer panel open during broadcasts

## Future Enhancements

- Real-time listener count integration
- Automated cue generation from shouts/track requests
- Episode analytics (listens, shares, engagement)
- Multi-show scheduling calendar
- Guest management for interviews
- Automated social media posting when episodes publish

