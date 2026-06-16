# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (hot-reload frontend + backend)
pnpm dev

# Type-check only
pnpm check

# Build (Vite frontend → dist/public + esbuild server → dist/index.mjs)
pnpm build

# Run tests
pnpm test

# Run a single test file
pnpm vitest run path/to/file.test.ts

# Database migrations
pnpm db:push          # generate + apply migrations

# Scheduled jobs (run individually)
pnpm jobs:rollup:hourly
pnpm jobs:sync:ticketmaster
```

**Package manager: pnpm only** (do not use npm/yarn — pnpm-lock.yaml is authoritative).

## Architecture

This is a monorepo with a **Vite SPA frontend** and **Express/tRPC backend** that share the same TypeScript project.

### Deployment split
- **Frontend**: Vercel (`vercel.json`) — serves `dist/public`, rewrites `/api/*` to Railway
- **Backend**: Railway (`railway.json`) — runs `dist/index.mjs`, auto-deploys from `main`
- The Vercel `/api/*` rewrite proxies to `https://web-production-a440b.up.railway.app/api/$1`, making the API same-origin from the browser (avoids CORS and cookie issues)

### Path aliases (tsconfig.json + vite.config.ts)
```
@/          → client/src/      (frontend code only)
@/client/   → client/src/
@/server/   → server/
@/drizzle/  → drizzle/
@/shared/   → shared/
@shared/    → shared/
```
**Critical**: Dynamic imports in `server/` must use `@/server/...` not `@/...` — the `@/` alias resolves to `client/src/` in the Vite build context.

### Server entrypoint
`server/_core/index.ts` — starts Express, registers all middleware/routes, sets up WebSockets. Key layers:
- `server/_core/env.ts` — validates env vars; **crashes on boot in production** if `DATABASE_URL` or `JWT_SECRET` (≥64 chars, must contain uppercase + numbers) are missing
- `server/routers.ts` — monolithic tRPC router (~1100 lines), all business logic procedures
- `server/db.ts` — lazy Drizzle ORM instance (`getDb()` returns null if `DATABASE_URL` unset, enabling local dev without DB)
- `server/domains/` — feature domains: auth, broadcast, commerce, content, ingestion, moderation, users, analytics, infrastructure

### Frontend entrypoint
`client/src/main.tsx` — sets up tRPC client (`/api/trpc` by default, or `VITE_API_URL`), React Query, service worker. Routes via `wouter` (patched at `patches/wouter@3.7.1.patch`).

### Database
- **Drizzle ORM** with postgres.js driver
- Schemas: `drizzle/schema.ts` (main), `drizzle/engagement-schema.ts` (live engagement), `drizzle/ai-features-schema.ts`, `drizzle/content-schema.ts`
- Migrations in `drizzle/` (numbered SQL files). Note: `0004` and `0005` have duplicate-numbered files — only the non-`redundant`/`premium` ones are canonical.

### Optional services (warn-only if missing)
All SDK instances that would crash on empty strings use `|| "sk_unconfigured_placeholder"` (Stripe) or lazy init inside functions. Missing: Stripe, PayPal, email, Spotify, Google OAuth, Sentry, Redis — these services degrade gracefully.

### Real-time
- WebSockets at `/ws` (live chat/donations) via `server/domains/broadcast/liveWebSocket.ts`
- Server-Sent Events at `/api/stream-events` via `server/domains/broadcast/streamEventsRouter.ts`

### Environment variables
**Required in production**: `DATABASE_URL`, `JWT_SECRET`
**Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
**Client-side** (must be prefixed `VITE_`): `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_API_URL`
**OAuth**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### CI/CD
- `.github/workflows/deploy-vercel.yml` — deploys frontend to Vercel on push to `main`
- `.github/workflows/deploy-railway.yml` — `workflow_dispatch` only; sets Railway env vars + redeploys
- `.github/workflows/database-backup.yml` — scheduled daily pg_dump to GitHub artifacts
- All jobs use `ubuntu-latest` (no self-hosted runner configured)
