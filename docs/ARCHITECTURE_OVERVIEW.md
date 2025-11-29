# Architecture Overview

## Major Modules

### Core Infrastructure
- **Database**: MySQL with Drizzle ORM
- **API Layer**: tRPC for type-safe API communication
- **Authentication**: OAuth-based with role-based access control (admin/user)
- **Frontend**: React + Vite + TypeScript
- **Routing**: Wouter for client-side routing

### Data Model Map

#### Core Tables
- `users` - User authentication and roles
- `shouts` - Fan messages and track requests
- `streams` - Stream configurations (Shoutcast/Icecast)
- `tracks` - Now playing and track history
- `shows` - Weekly show schedule
- `eventBookings` - DJ booking requests

#### Revenue Stack
- `supportEvents` - Tips/donations
- `products` - Digital products (drops, soundpacks, etc.)
- `purchases` - Product purchase records
- `subscriptions` - VIP tier subscriptions

#### Brand Layer
- `brands` - Multi-brand support (Danny, Hectic Radio, DreamSpire, etc.)

#### Safety & Reputation
- `auditLogs` - Admin action tracking
- `empireSettings` - Kill switches and feature toggles

#### Observability
- `errorLogs` - Application error tracking
- `incidentBanners` - Global incident messages

#### Backup & Recovery
- `backups` - Backup snapshots with checksums

#### Notifications
- `notifications` - Unified notification system (web push, email, WhatsApp, in-app)

#### Empire API
- `apiKeys` - External API access keys with scopes

### How Features Connect

#### Live Listening Flow
1. User visits `/live` or homepage
2. `LiveAudioPlayer` component calls `trpc.streams.active.useQuery()`
3. Backend returns active stream configuration
4. Player connects to `publicUrl` from stream config
5. Status updates via `trpc.streams.status.useQuery()` (admin only)

#### Shoutbox Flow
1. User submits shout via `ShoutForm` component
2. Calls `trpc.shouts.create.mutate()`
3. Backend validates and stores in `shouts` table
4. Admin reviews in `/admin/shouts`
5. Admin approves/reads on air
6. Public list shows approved shouts via `trpc.shouts.list.useQuery()`

#### AI Integration
- All AI features use stubbed responses in `server/_core/ai*.ts` files
- Clear hooks for real AI integration via environment variables
- Context building functions gather relevant data (now playing, shows, shouts)

#### Revenue Flow
1. Support events: User submits tip → `trpc.revenue.support.create`
2. Products: Admin creates product → User purchases → `trpc.revenue.purchases.create`
3. Subscriptions: User subscribes to tier → `trpc.revenue.subscriptions.create`

#### Empire Control
- `/admin/empire` shows aggregated metrics
- Kill switches via `trpc.safety.settings.set`
- All admin actions logged to `auditLogs`

### File Structure

```
server/
  _core/          - Core utilities (env, cookies, tRPC setup, AI stubs)
  db.ts           - Database helper functions
  routers.ts      - tRPC router definitions

client/
  src/
    pages/        - Route pages
    components/   - Reusable components
    lib/          - Utilities (trpc client, phone utils, etc.)
    _core/        - Client-side core (hooks, etc.)

drizzle/
  schema.ts       - Database schema definitions
```

