# DJ Danny Live Engagement Features - Integration Checklist

## Pre-Integration Setup

- [ ] PostgreSQL database ready (v13+)
- [ ] Stripe account created with test keys ready
- [ ] Environment variables file prepared
- [ ] All npm dependencies installed (`pnpm install`)

## Step 1: Database Setup

### 1.1 Create Schema Files
- [x] `/drizzle/engagement-schema.ts` - Table definitions
- [x] `/drizzle/migrations/001_engagement_features.sql` - Migration SQL

### 1.2 Run Migration
```bash
# Option 1: Using Drizzle Kit (recommended)
drizzle-kit generate
pnpm db:push

# Option 2: Manual SQL
psql -d your_database_name -f drizzle/migrations/001_engagement_features.sql
```

- [ ] Verify all 13 tables created:
  - [ ] live_sessions
  - [ ] chat_messages
  - [ ] user_badges
  - [ ] donations
  - [ ] reactions
  - [ ] polls
  - [ ] poll_votes
  - [ ] leaderboards
  - [ ] notifications
  - [ ] streamer_stats
  - [ ] custom_emotes
  - [ ] raids
  - [ ] social_links

- [ ] Verify all indices created
- [ ] Verify enum types created

## Step 2: Backend Integration

### 2.1 Add tRPC Router
File: `/server/routers.ts`

```typescript
import { liveRouter } from "./routers/liveRouter";

export const appRouter = router({
  // ... existing routers
  live: liveRouter,
});
```

- [ ] Router imported
- [ ] Router added to appRouter
- [ ] No TypeScript errors

### 2.2 Add Backend Files
- [x] `/server/routers/liveRouter.ts` - API endpoints (1038 lines)
- [x] `/server/_core/stripeWebhook.ts` - Stripe webhook handler (199 lines)
- [x] `/server/routers/liveWebSocket.ts` - Real-time WebSocket (244 lines)

### 2.3 Configure Stripe

Add to `.env` or environment variables:
```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

- [ ] Stripe secret key set
- [ ] Stripe publishable key set
- [ ] Stripe webhook secret set
- [ ] Keys verified in application code (ENV.stripeSecretKey, etc.)

### 2.4 Initialize WebSocket

File: `/server/_core/index.ts` (or similar Express setup)

```typescript
import WebSocket from "ws";
import { initializeLiveWebSocket } from "./routers/liveWebSocket";

// Create WebSocket server
const wss = new WebSocket.Server({ noServer: true });
initializeLiveWebSocket(wss);

// Handle HTTP upgrades to WebSocket
server.on("upgrade", (request, socket, head) => {
  if (request.url?.startsWith("/api/live/ws")) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  }
});
```

- [ ] WebSocket server created
- [ ] Upgrade handler registered
- [ ] WebSocket path correct (/api/live/ws)

### 2.5 Add Stripe Webhook Endpoint

File: `/api/webhooks.ts` or similar

```typescript
import { handleStripeWebhook, verifyWebhookSignature } from "@/server/_core/stripeWebhook";

app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = JSON.parse(req.body);
  const result = await handleStripeWebhook(event);
  res.json(result);
});
```

- [ ] Endpoint created at `/api/webhooks/stripe`
- [ ] Signature verification implemented
- [ ] Event parsing correct
- [ ] Response format correct

### 2.6 Configure Stripe Webhook in Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - charge.refunded
   - dispute.created
5. Copy webhook secret to environment variable

- [ ] Webhook endpoint registered in Stripe dashboard
- [ ] Webhook secret added to environment
- [ ] All event types selected

## Step 3: Frontend Integration

### 3.1 Create Live Components Directory
```bash
mkdir -p client/src/components/live
```

- [x] `/client/src/components/live/LiveChat.tsx` (340 lines)
- [x] `/client/src/components/live/DonationPanel.tsx` (382 lines)
- [x] `/client/src/components/live/ReactionButtons.tsx` (218 lines)
- [x] `/client/src/components/live/LiveLeaderboard.tsx` (260 lines)
- [x] `/client/src/components/live/PollWidget.tsx` (200 lines)

### 3.2 Create Utilities
- [x] `/client/src/lib/useRealtime.ts` (148 lines)

### 3.3 Verify UI Component Dependencies

All required components from `@radix-ui` and `@shadcn/ui`:
- [ ] Button
- [ ] Input
- [ ] Dialog
- [ ] Tabs
- [ ] Avatar
- [ ] Progress
- [ ] DropdownMenu
- [ ] Textarea
- [ ] ScrollArea

Install missing components:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
# ... etc
```

### 3.4 Install Stripe Components

Already in package.json:
- [ ] `@stripe/react-stripe-js` (^5.4.1)
- [ ] `@stripe/stripe-js` (^4.10.0)

### 3.5 Setup Stripe Elements Provider

File: `/client/src/main.tsx` or `App.tsx`

```typescript
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

export function App() {
  return (
    <Elements stripe={stripePromise}>
      {/* Your routes/components */}
    </Elements>
  );
}
```

- [ ] Stripe Elements provider wrapped
- [ ] Publishable key configured
- [ ] No TypeScript errors

### 3.6 Create Example Page

- [x] `/client/src/pages/LiveStreamPage.example.tsx` (334 lines)

## Step 4: Configuration Files

### 4.1 Environment Variables

Create or update `.env.local`:
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# API
VITE_API_URL=http://localhost:3000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

- [ ] All Stripe keys added
- [ ] API URL configured
- [ ] Development vs production keys separated

### 4.2 TypeScript Configuration

Verify tsconfig.json includes strict mode:
```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

- [ ] TypeScript strict mode enabled
- [ ] No type errors in new files

## Step 5: Testing

### 5.1 Type Checking
```bash
pnpm check
```

- [ ] No TypeScript errors
- [ ] All imports resolved

### 5.2 Build Verification
```bash
pnpm build
```

- [ ] Frontend builds successfully
- [ ] Backend builds successfully
- [ ] No build errors

### 5.3 Manual Integration Tests

- [ ] Test chat message sending
  - [ ] Message appears in database
  - [ ] Message broadcasts via WebSocket
  - [ ] Rate limiting works (500ms)

- [ ] Test donation flow
  - [ ] Donation panel opens
  - [ ] Stripe card element renders
  - [ ] Payment intent created
  - [ ] Confirmation successful
  - [ ] Badge awarded

- [ ] Test reactions
  - [ ] Reaction button works
  - [ ] Combo tracked correctly
  - [ ] Counts display in real-time
  - [ ] Cooldown enforced

- [ ] Test polls
  - [ ] Poll creates successfully
  - [ ] Voting works
  - [ ] Results update real-time
  - [ ] Duplicate voting prevented
  - [ ] Timer counts down

- [ ] Test leaderboard
  - [ ] Top donors display correctly
  - [ ] Top chatters display correctly
  - [ ] Refresh interval works (15s)
  - [ ] Badges display on donations

- [ ] Test WebSocket
  - [ ] Connection established
  - [ ] Messages broadcast
  - [ ] Reconnection works
  - [ ] Keep-alive pinging works

- [ ] Test Stripe webhook
  - [ ] Webhook signature verification works
  - [ ] Payment events processed
  - [ ] Badges awarded automatically
  - [ ] Refunds handled

## Step 6: Performance Optimization

- [ ] Database indices created and verified
- [ ] React Query caching configured
- [ ] Pagination limits set (50 messages)
- [ ] Polling intervals optimized
- [ ] Component memoization verified
- [ ] Bundle size checked

## Step 7: Security Review

- [ ] Rate limiting implemented (500ms for chat/reactions)
- [ ] Input validation with Zod
- [ ] CSRF protection configured
- [ ] CORS properly configured
- [ ] Admin role checks in place
- [ ] User context verified on protected endpoints
- [ ] Stripe webhook signature verified
- [ ] No secrets in frontend code
- [ ] Environment variables properly masked

## Step 8: Documentation

- [x] `/LIVE_ENGAGEMENT_IMPLEMENTATION.md` - Complete setup guide
- [x] `/LIVE_ENGAGEMENT_SUMMARY.txt` - Feature summary
- [x] `/client/src/pages/LiveStreamPage.example.tsx` - Usage example
- [ ] Code comments added for complex logic
- [ ] API documentation updated in OpenAPI/Swagger (if applicable)

## Step 9: Deployment

### 9.1 Production Environment Variables
- [ ] Stripe production keys configured
- [ ] Database connection URL set
- [ ] WebSocket URL uses wss:// (SSL/TLS)
- [ ] CORS domains configured
- [ ] Error logging configured

### 9.2 Database
- [ ] Backups configured
- [ ] Connection pooling optimized
- [ ] Query logging enabled (optional)
- [ ] Slow query monitoring set up

### 9.3 Monitoring
- [ ] API error tracking (Sentry, etc.)
- [ ] Database performance monitoring
- [ ] WebSocket connection monitoring
- [ ] Stripe webhook success rate tracking

### 9.4 Deployment Steps
```bash
# 1. Run migrations on production
pnpm db:push --env production

# 2. Build frontend
pnpm build

# 3. Deploy frontend
# (to Vercel, your hosting, etc.)

# 4. Start server
pnpm start

# 5. Configure Stripe webhooks (production)
# Update webhook URL in Stripe dashboard
```

- [ ] Production database migrated
- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] WebSocket accessible
- [ ] Stripe webhooks configured for production
- [ ] SSL/TLS enabled
- [ ] Monitoring active

## Step 10: Final Verification

- [ ] All features working end-to-end
- [ ] Chat messages persist and display
- [ ] Donations process and award badges
- [ ] Reactions count and show combos
- [ ] Polls create and accept votes
- [ ] Leaderboards rank correctly
- [ ] Notifications display
- [ ] WebSocket connects and stays alive
- [ ] Mobile responsive
- [ ] Error handling graceful
- [ ] Performance acceptable

## Post-Launch Maintenance

- [ ] Monitor error logs daily
- [ ] Check Stripe webhook logs
- [ ] Review database performance metrics
- [ ] Update dependencies monthly
- [ ] Test disaster recovery plan
- [ ] Review security logs

## Troubleshooting Checklist

If experiencing issues:

### Database Connection Issues
- [ ] PostgreSQL running
- [ ] Connection string correct in env
- [ ] Port 5432 accessible
- [ ] User permissions correct

### Stripe Issues
- [ ] Keys correct and not reversed
- [ ] Webhook endpoint responding 200
- [ ] Webhook signature verification not failing
- [ ] Payment intent states logged for debugging

### WebSocket Issues
- [ ] Server configured for upgrade
- [ ] Path matches client connection
- [ ] Port accessible externally
- [ ] SSL/TLS properly configured for wss://

### Component Issues
- [ ] All dependencies installed
- [ ] Stripe Elements provider wrapping components
- [ ] Correct API endpoint URLs
- [ ] No CORS errors in console

---

**Expected Completion Time:** 4-6 hours for full setup and testing

**Support Resources:**
- Implementation Guide: `/LIVE_ENGAGEMENT_IMPLEMENTATION.md`
- Feature Summary: `/LIVE_ENGAGEMENT_SUMMARY.txt`
- Example Page: `/client/src/pages/LiveStreamPage.example.tsx`
- Stripe Docs: https://stripe.com/docs
- tRPC Docs: https://trpc.io
- WebSocket Docs: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
