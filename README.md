# DJ Danny Hectic B

A modern web application for DJ Danny Hectic B featuring mixes, events, live studio, live radio streaming, and a fan shoutbox.


## Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (v10 or higher) - [Install pnpm](https://pnpm.io/installation)
- **MySQL** (or compatible database) - for production
- **macOS** (for this guide, but works on Linux/Windows too)

## Quick Start (From Zero to Running)

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd ~/Desktop/projects/djdannyhecticb

# Install dependencies
pnpm install

# Approve any required builds
pnpm approve-builds
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your preferred editor
# nano .env
# or
# code .env
```

**Minimum required variables for local development:**

```env
# Backend OAuth Configuration
OAUTH_SERVER_URL=http://localhost:3000

# Application ID (required for OAuth)
APP_ID=your-app-id-here
# OR use VITE_APP_ID (both work)
VITE_APP_ID=your-app-id-here

# JWT Secret (generate a random string)
JWT_SECRET=your-random-secret-key-here

# Database (optional for basic dev, required for full features)
DATABASE_URL=mysql://user:password@localhost:3306/dbname

# Frontend OAuth Portal URL
VITE_OAUTH_PORTAL_URL=http://localhost:3000
# OR
VITE_OAUTH_SERVER_URL=http://localhost:3000

# App Branding
VITE_APP_TITLE=DJ Danny Hectic B
VITE_APP_LOGO=/logo-icon.png
```

**Important Notes:**
- Variables prefixed with `VITE_` are exposed to the frontend (client-side)
- Variables without `VITE_` are server-side only
- The backend can read both `APP_ID` and `VITE_APP_ID` for compatibility
- The frontend can read both `VITE_OAUTH_PORTAL_URL` and `VITE_OAUTH_SERVER_URL` for compatibility

### 3. Set Up Database and Run Migrations

```bash
# Generate and run database migrations (creates shouts table)
pnpm db:push
```

**Note:** If you don't have a database set up yet, you can still run the app, but the shoutbox feature won't work. For full functionality, set up MySQL and configure `DATABASE_URL` in your `.env`.

### 4. Start the Development Server

```bash
# Start the dev server (runs on http://localhost:3000 by default)
pnpm dev
```

You should see:
- `[OAuth] Initialized with baseURL: <your-oauth-url>` (should NOT be empty)
- `Server running on http://localhost:3000/`

### 5. Verify Everything Works

1. Open your browser to `http://localhost:3000`
2. The homepage should load without crashing
3. You should see:
   - A "Send Danny a Shout" form on the homepage
   - A "Latest Shouts" section showing approved shouts
   - A sticky audio player bar at the bottom (LIVE NOW on Hectic Radio)
4. No console errors about `%VITE_*%` or undefined variables
5. The OAuth baseURL in server logs should show your configured URL (not empty)

## Troubleshooting

### Issue: OAuth baseURL is empty

**Symptoms:**
- Server logs show: `[OAuth] Initialized with baseURL:` (empty)
- Error: `[OAuth] ERROR: OAUTH_SERVER_URL is not configured!`

**Solution:**
1. Check that `.env` file exists in the project root
2. Verify `OAUTH_SERVER_URL` is set in `.env`
3. Restart the dev server after changing `.env`
4. Ensure `.env` is in the project root (same directory as `package.json`)

### Issue: Homepage crashes with React error

**Symptoms:**
- React error stack pointing to `getLoginUrl()` in `src/const.ts`
- Error about `undefined` when creating URL

**Solution:**
1. Ensure `VITE_OAUTH_PORTAL_URL` or `VITE_OAUTH_SERVER_URL` is set in `.env`
2. Ensure `VITE_APP_ID` or `APP_ID` is set in `.env`
3. The app now has defensive checks and will show warnings instead of crashing
4. Check browser console for specific missing variable warnings

### Issue: VITE_* variables not loading

**Symptoms:**
- `import.meta.env.VITE_*` returns `undefined`
- Variables work in backend but not frontend

**Solution:**
1. Ensure variables are prefixed with `VITE_` for frontend access
2. Restart the dev server after changing `.env` (Vite needs restart)
3. Check that `.env` is in the project root (Vite reads from `envDir` in `vite.config.ts`)

### Issue: Analytics script errors

**Symptoms:**
- Console errors about analytics script
- `%VITE_ANALYTICS_ENDPOINT%` appearing in HTML

**Solution:**
- This is now fixed! Analytics script is conditionally loaded and won't break dev mode
- Set `VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID` in `.env` only for production

## Project Structure

```
djdannyhecticb/
├── client/              # Frontend React app (Vite)
│   ├── src/
│   │   ├── _core/      # Core hooks and utilities
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   └── const.ts    # Frontend constants (uses import.meta.env)
│   └── index.html
├── server/             # Backend Express server
│   ├── _core/
│   │   ├── env.ts      # Backend env config (uses process.env)
│   │   ├── oauth.ts    # OAuth routes
│   │   └── sdk.ts      # OAuth SDK
│   └── index.ts        # Server entry point
├── shared/             # Shared code between client and server
├── .env                # Your environment variables (create from .env.example)
├── .env.example        # Template for environment variables
└── package.json
```

## Environment Variable Reference

### Backend Variables (Server-side only)

| Variable | Required | Description |
|----------|----------|-------------|
| `OAUTH_SERVER_URL` | Yes | Base URL of OAuth authentication server |
| `APP_ID` | Yes | OAuth application/client ID (or use `VITE_APP_ID`) |
| `JWT_SECRET` | Yes | Secret key for signing session tokens |
| `DATABASE_URL` | Optional | Database connection string |
| `OWNER_OPEN_ID` | Optional | OpenID of app owner/admin |
| `BUILT_IN_FORGE_API_URL` | Optional | Forge API URL |
| `BUILT_IN_FORGE_API_KEY` | Optional | Forge API key |

### Frontend Variables (Client-side, must be prefixed with `VITE_`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_APP_ID` | Yes | OAuth application/client ID |
| `VITE_OAUTH_PORTAL_URL` | Yes | OAuth portal URL (or use `VITE_OAUTH_SERVER_URL`) |
| `VITE_APP_TITLE` | No | Application title (default: "DJ Danny Hectic B") |
| `VITE_APP_LOGO` | No | Path to app logo (default: "/logo-icon.png") |
| `VITE_ANALYTICS_ENDPOINT` | No | Analytics endpoint (optional, safe defaults for dev) |
| `VITE_ANALYTICS_WEBSITE_ID` | No | Analytics website ID (optional, safe defaults for dev) |
| `VITE_HECTIC_RADIO_STREAM_URL` | No | Live radio stream URL for the audio player (optional, placeholder used if not set) |

## Development Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type check
pnpm check

# Format code
pnpm format

# Run tests
pnpm test

# Database migrations
pnpm db:push
```

## How Environment Variables Are Loaded

### Backend (Express/tsx)
- Uses `dotenv` package via `import "dotenv/config"` in `server/_core/index.ts`
- Loads `.env` from project root automatically
- Variables accessed via `process.env.*`
- No prefix required for server-side variables

### Frontend (Vite)
- Vite automatically loads `.env` files from project root (configured in `vite.config.ts`)
- Only variables prefixed with `VITE_` are exposed to client code
- Variables accessed via `import.meta.env.VITE_*`
- Must restart dev server after changing `.env` for Vite to pick up changes

## Security Notes

- **Never commit `.env` to version control** (it's in `.gitignore`)
- Use strong, random values for `JWT_SECRET` in production
- Keep `VITE_*` variables safe - they're exposed to the browser
- Don't put secrets in `VITE_*` prefixed variables

## Features

### Hectic Hotline
- **WhatsApp Integration**: "Chat on WhatsApp" button opens WhatsApp with pre-filled message
- **Direct Calling**: "Call Now" button initiates phone call
- **Visible Everywhere**: Featured in homepage hero and compact version in footer
- **Contact Saving**: vCard download link to save "DJ Danny Hectic B" to contacts

### Shoutbox + WhatsApp CRM
- **Public Shout Form**: Fans can send messages, track requests, and provide phone number
- **WhatsApp Opt-In**: Optional checkbox to allow WhatsApp replies
- **Privacy Protected**: Phone numbers never shown in public shout list
- **Admin WhatsApp Replies**: One-click WhatsApp button in admin panel with pre-filled message template
- **Shout List**: Displays the latest approved shouts on homepage
- **Admin Management**: Admins can approve shouts, mark them as read on air, and filter shouts at `/admin/shouts`

### Live Audio Player
- **Sticky Player Bar**: Always-visible audio player at the bottom of every page
- **Active Stream Management**: Automatically uses active stream from Stream Ops panel
- **Fallback Support**: Falls back to `VITE_HECTIC_RADIO_STREAM_URL` if no active stream
- **Play/Pause Controls**: Simple controls with volume slider
- **Live Indicator**: Visual "LIVE NOW" indicator with pulsing animation
- **Stream Status**: Shows active stream name and handles offline gracefully

### Stream Operations (Shoutcast/Icecast)
- **Stream Management**: Add/edit/delete Shoutcast, Icecast, or custom streams
- **Active Stream Selection**: Set which stream the player uses
- **Status Monitoring**: Real-time status checks (online/offline, listeners, now playing)
- **DJ Connection Helper**: Copy-ready connection details for BUTT, OBS, RadioDJ
- **Admin Panel**: Access `/admin/streams` when logged in as admin

### Admin Features
- **Shout Management**: Access `/admin/shouts` when logged in as admin (role = "admin")
- **Approval System**: Toggle approval status for shouts
- **On-Air Tracking**: Mark shouts as read on air
- **Filtering**: Filter shouts by approval status and read-on-air status
- **WhatsApp Integration**: Direct WhatsApp replies to listeners who opted in

## Database Schema

The shoutbox feature requires a `shouts` table. Run migrations with:

```bash
pnpm db:push
```

The shouts table includes:
- `id` (auto-increment primary key)
- `name` (required, max 255 chars)
- `location` (optional, max 255 chars)
- `message` (required, max 2000 chars)
- `trackRequest` (optional, max 255 chars)
- `canReadOnAir` (boolean, default false)
- `approved` (boolean, default false - requires admin approval)
- `readOnAir` (boolean, default false)
- `createdAt` / `updatedAt` (timestamps)

## Setting Up the Radio Stream

1. Get your live stream URL from your streaming provider (Icecast, Shoutcast, etc.)
2. Add it to your `.env` file:
   ```env
   VITE_HECTIC_RADIO_STREAM_URL=https://your-stream-url.com/live
   ```
3. Restart the dev server
4. The player will appear at the bottom of every page

**Note:** For local development, you can leave this empty - the player will show but won't play audio (no errors).

## Admin Access

To access admin features:
1. Ensure your user has `role = "admin"` in the database
2. Users with `openId` matching `OWNER_OPEN_ID` in `.env` are automatically set as admin
3. Log in and navigate to `/admin/shouts`

## Daily Usage Guide

### Using the Hectic Hotline

**On Homepage:**
- Tap "Chat on WhatsApp" → Opens WhatsApp to 07957 432842 with pre-filled message
- Tap "Call Now" → Initiates phone call
- Find "Save HECTIC as a contact" link in footer → Tap on mobile to add to contacts

### Managing Shouts + WhatsApp Replies

1. **Fans submit shouts** via homepage form (with optional phone + WhatsApp opt-in)
2. **Go to `/admin/shouts`** to review and approve
3. **Click WhatsApp button** (if phone + opt-in present) → Opens WhatsApp with pre-filled reply:
   ```
   "Yo {name}, it's Danny from Hectic Radio. Got your shout: "{message}" – you're locked in fam."
   ```

### Setting Up Your Radio Stream

1. **Go to `/admin/streams`**
2. **Add New Stream:**
   - Name: "Main Hectic Radio"
   - Type: Shoutcast or Icecast
   - Public URL: Your listen URL from your streaming host
   - (Optional) Admin API URL/user/password for status checks
3. **Click "Set Active"** on your main stream
4. **Copy DJ Connection Details** from the stream card
5. **Paste into your encoder** (BUTT, OBS, RadioDJ, etc.)

The player will automatically use the active stream and show status if configured.

## Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your `.env` file matches `.env.example` structure
3. Ensure all required variables are set
4. Check that database migrations have been run (`pnpm db:push`)
5. Check server logs for specific error messages
6. Check browser console for client-side errors

## License

MIT

