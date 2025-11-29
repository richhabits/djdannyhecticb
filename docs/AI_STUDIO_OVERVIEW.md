# AI Studio Overview

## Architecture

The AI Studio is built on a provider-agnostic abstraction layer that allows switching between different AI providers without changing application code.

### Core Components

#### 1. AI Provider Abstraction (`server/_core/aiProviders.ts`)

The abstraction layer supports three types of AI operations:

- **Chat/LLM** (`chat`): Text generation for scripts, responses, content
- **Text-to-Speech** (`tts`): Voice generation from text
- **Video Host** (`videoHost`): Video generation from scripts

**Supported Providers:**
- `openai` - OpenAI GPT models (stub ready for integration)
- `elevenlabs` - ElevenLabs TTS (stub ready for integration)
- `d-id` - D-ID video generation (stub ready for integration)
- `mock` - Mock provider for development (default)
- `none` - Disabled

**Provider Selection:**
1. Checks `empireSettings` table for `ai_<type>_provider` setting
2. Falls back to environment variables (`AI_CHAT_PROVIDER`, `AI_TTS_PROVIDER`, `AI_VIDEO_PROVIDER`)
3. Defaults to `mock` if not configured

#### 2. AI Script Factory (`server/_core/aiScriptFactory.ts`)

Generates scripts for various purposes:
- **Intro** - Show intros
- **Outro** - Show outros
- **Mix Story** - Mix narratives
- **TikTok Clip** - Social media scripts
- **Promo** - Promotional copy
- **Fan Shout** - Personalized fan shouts
- **Generic** - General purpose scripts

**Flow:**
1. Create script job → stored in `aiScriptJobs` table
2. Process job → calls AI provider (chat) with context-aware prompt
3. Result stored in `resultText` field

#### 3. AI Voice Factory (`server/_core/aiVoiceFactory.ts`)

Generates voice audio from scripts:
- Takes script text (from script job or raw text)
- Uses TTS provider to generate audio
- Stores audio URL in `aiVoiceJobs` table

**Voice Profiles:**
- `hectic_main` - Main Danny voice
- `hectic_soft` - Softer tone
- `hectic_shouty` - High energy

#### 4. AI Video Factory (`server/_core/aiVideoFactory.ts`)

Generates video clips from scripts:
- Takes completed script job
- Uses video host provider to generate video
- Supports multiple style presets:
  - `verticalShort` - TikTok/Reels format
  - `squareClip` - Instagram format
  - `horizontalHost` - YouTube/standard format

## Database Schema

### `aiScriptJobs`
- `id` - Primary key
- `type` - Script type (enum)
- `inputContext` - JSON context data
- `requestedByUserId` - Optional user ID
- `status` - pending, processing, completed, failed
- `resultText` - Generated script text
- `errorMessage` - Error details if failed

### `aiVoiceJobs`
- `id` - Primary key
- `scriptJobId` - Optional FK to script job
- `rawText` - Direct text input
- `voiceProfile` - Voice profile to use
- `status` - pending, processing, completed, failed
- `audioUrl` - Generated audio URL
- `errorMessage` - Error details if failed

### `aiVideoJobs`
- `id` - Primary key
- `scriptJobId` - FK to script job (required)
- `stylePreset` - Video format preset
- `status` - pending, processing, completed, failed
- `videoUrl` - Generated video URL
- `thumbnailUrl` - Video thumbnail URL
- `errorMessage` - Error details if failed

### `userConsents`
- `id` - Primary key
- `profileId` / `userId` / `email` - User identifier
- `aiContentConsent` - Consent for AI content usage
- `marketingConsent` - Marketing consent
- `dataShareConsent` - Data sharing consent

## Admin Pages

### `/admin/ai-studio`
Unified dashboard showing:
- Today's script/voice/video job counts
- Recent jobs across all types
- Error tracking
- Quick links to dedicated pages

### `/admin/ai-scripts`
Script Factory panel:
- List all script jobs
- Filter by status/type
- View job details (context + result)
- Process pending jobs
- Re-process failed jobs

### `/admin/ai-voice`
Voice Studio:
- List voice jobs
- Play generated audio
- Process pending jobs
- Re-generate failed jobs

### `/admin/ai-video`
Video Studio:
- List video jobs
- Play generated videos
- View thumbnails
- Process pending jobs

## Fan-Facing Features

### `/ai-shout`
AI Shout Studio:
- Form to create personalized AI shouts
- Vibe selector (Fun, Savage, Romantic, Motivational)
- Optional voice generation
- Consent checkbox for content usage
- Public view of completed shouts

## Safety & Consent

### Kill Switches
Managed in `/admin/empire`:
- **AI Studio Enabled** - Master switch for all AI features
- **Fan-Facing AI Tools** - Controls public access to AI tools

### Consent Model
- Users must consent to AI content usage before creating fan-facing content
- Consent stored in `userConsents` table
- Admin can view consent stats in `/admin/ai-studio`

## Integration with Real Providers

### OpenAI (Chat)
1. Set `OPENAI_API_KEY` in `.env`
2. Set `ai_chat_provider` setting to `"openai"` in Empire settings
3. Implement `chatCompletionOpenAI()` in `aiProviders.ts`

### ElevenLabs (TTS)
1. Set `ELEVENLABS_API_KEY` in `.env`
2. Set `ai_tts_provider` setting to `"elevenlabs"`
3. Set `voice_id_hectic_main` setting to your voice ID
4. Implement `ttsElevenLabs()` in `aiProviders.ts`

### D-ID (Video)
1. Set `DID_API_KEY` in `.env`
2. Set `ai_video_provider` setting to `"d-id"`
3. Implement `videoHostDID()` in `aiProviders.ts`

## Workflow Examples

### Generate Intro Script
```typescript
const jobId = await generateIntroScript({ eventInfo: { title: "Hectic Nights" } });
// Job created, status: pending
// Admin processes via /admin/ai-scripts
```

### Generate Voice from Script
```typescript
const voiceJobId = await createAiVoiceJob({ scriptJobId: 123, voiceProfile: "hectic_main" });
// Voice job created
// Admin processes via /admin/ai-voice
```

### Generate Video from Script
```typescript
const videoJobId = await createAiVideoJob({ scriptJobId: 123, stylePreset: "verticalShort" });
// Video job created
// Admin processes via /admin/ai-video
```

## Future Automation

The system is designed for future automation:
- Cron jobs can process pending jobs automatically
- Queue system (BullMQ) can handle job processing
- Webhooks can trigger processing on job creation
- Real-time updates via WebSockets for job status

All jobs are stored in the database, making it easy to add automation later without changing the core structure.

