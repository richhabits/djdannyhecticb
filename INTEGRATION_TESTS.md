# Integration Testing Plan

## External API Integration Points

### 1. Stripe Payment Processing

**Endpoint**: `POST /api/trpc/donations.createPaymentIntent`

**Test Cases**:
```bash
# Test Case 1: Valid payment intent
curl -X POST http://localhost:3000/api/trpc/donations.createPaymentIntent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2000,
    "currency": "gbp",
    "fanName": "Test Fan",
    "email": "test@example.com"
  }'
# Expected: Returns Stripe payment intent ID

# Test Case 2: Invalid amount
# Expected: Error response with validation

# Test Case 3: Webhook handling
# Simulate Stripe webhook:
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "stripe-signature: t=..." \
  -d '{webhook payload}'
# Expected: Payment status updated in database
```

**Success Criteria**:
- ✅ Payment intent created with correct amount
- ✅ Webhook signature validated
- ✅ Payment status persisted in DB
- ✅ Error handling for invalid inputs

---

### 2. Ticketmaster Events API

**Endpoint**: `GET /api/trpc/events.upcoming`

**Test Cases**:
```bash
# Test Case 1: Fetch upcoming events
curl http://localhost:3000/api/trpc/events.upcoming
# Expected: Array of events from Ticketmaster API

# Test Case 2: Search events by location
curl 'http://localhost:3000/api/trpc/events.search?input={"query":"London"}'
# Expected: Events filtered by location

# Test Case 3: Get event by ID
curl 'http://localhost:3000/api/trpc/events.byId?input={"id":12345}'
# Expected: Single event details
```

**Success Criteria**:
- ✅ Events populated with real Ticketmaster data
- ✅ Search filtering works correctly
- ✅ Event data includes title, venue, date, price
- ✅ Rate limiting respected (50 requests/min)

---

### 3. YouTube Webhooks

**Setup**: Configure YouTube webhook URL in settings
```
Webhook URL: https://staging.djdannyhecticb.com/api/webhooks/youtube
```

**Test Cases**:
```bash
# Simulate video published
curl -X POST http://localhost:3000/api/webhooks/youtube \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {"channelId": "UC..."},
    "contentObjectId": "video_id_123"
  }'
# Expected: Video imported to database, notifications sent

# Verify webhook processing
curl http://localhost:3000/api/trpc/content.latestYouTubeVideos
# Expected: New video appears in list
```

**Success Criteria**:
- ✅ Webhook signature validated
- ✅ Video metadata fetched from YouTube API
- ✅ Video stored in content domain
- ✅ Notifications sent to subscribed users

---

### 4. Spotify API Integration

**Endpoint**: `POST /api/trpc/spotify.syncPlaylist`

**Test Cases**:
```bash
# Test Case 1: Sync playlist from Spotify
curl -X POST http://localhost:3000/api/trpc/spotify.syncPlaylist \
  -H "Content-Type: application/json" \
  -d '{"playlistId": "spotify:playlist:..."}'
# Expected: Playlist tracks synced to database

# Test Case 2: Get artist releases
curl 'http://localhost:3000/api/trpc/spotify.getArtistReleases?input={"artistId":"..."}'
# Expected: Latest album/track info

# Test Case 3: OAuth flow
# Redirect to Spotify: https://accounts.spotify.com/authorize?...
# After auth, verify token stored and accessible
```

**Success Criteria**:
- ✅ OAuth token persisted securely
- ✅ Playlist tracks synced correctly
- ✅ Pagination handled for large playlists
- ✅ Cache updated periodically

---

### 5. Authentication & OAuth

**Endpoints**:
- `POST /api/trpc/auth.register` - Create account
- `GET /api/oauth/google/callback` - Google OAuth
- `POST /api/trpc/auth.logout` - End session

**Test Cases**:
```bash
# Test Case 1: Google OAuth Flow
# 1. Redirect to Google: oauth.google.com/authorize
# 2. Get auth code
curl 'http://localhost:3000/api/oauth/google/callback?code=...'
# Expected: Session created, redirected to dashboard

# Test Case 2: User Registration
curl -X POST http://localhost:3000/api/trpc/auth.register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
# Expected: User created, session established

# Test Case 3: Session Persistence
# Request with session cookie
curl -b "session=..." http://localhost:3000/api/trpc/auth.me
# Expected: Current user data returned

# Test Case 4: Logout
curl -X POST http://localhost:3000/api/trpc/auth.logout \
  -b "session=..."
# Expected: Session cleared
```

**Success Criteria**:
- ✅ OAuth tokens stored securely (JWT)
- ✅ Session cookies httpOnly & Secure
- ✅ CSRF protection enabled
- ✅ Password hashing validated

---

### 6. PayPal Integration (Donations)

**Endpoint**: `POST /api/trpc/donations.createPayPalOrder`

**Test Cases**:
```bash
# Test Case 1: Create PayPal order
curl -X POST http://localhost:3000/api/trpc/donations.createPayPalOrder \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "20.00",
    "currency": "GBP",
    "fanName": "Test Fan"
  }'
# Expected: PayPal order ID returned

# Test Case 2: Webhook - Payment approved
curl -X POST http://localhost:3000/api/webhooks/paypal \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "CHECKOUT.ORDER.APPROVED",
    "resource": {"id": "order_id_..."}
  }'
# Expected: Donation recorded, confirmation sent
```

**Success Criteria**:
- ✅ PayPal orders created in sandbox
- ✅ Webhooks verified (signature check)
- ✅ Payment status updated in DB
- ✅ Refunds handled correctly

---

## Integration Test Matrix

| API | Endpoint | Status | Notes |
|-----|----------|--------|-------|
| Stripe | Payment Intent | ✅ Ready | Use sandbox keys |
| Ticketmaster | Events Search | ✅ Ready | Rate limits: 50/min |
| YouTube | Webhook | 🔄 Needs Config | Requires channel access |
| Spotify | OAuth + API | 🔄 Needs Config | Requires app approval |
| PayPal | Orders | 🔄 Needs Sandbox | Use test credentials |
| Google OAuth | Login | 🔄 Needs Config | Requires redirect URI |
| Twitch OAuth | Login | 🔄 Optional | Can be added later |

---

## Test Execution Order

1. **Phase 1: Core Auth** (30 min)
   - Register user
   - Google OAuth
   - Session persistence
   - Logout

2. **Phase 2: Data APIs** (30 min)
   - Ticketmaster events
   - YouTube latest videos
   - Spotify playlists

3. **Phase 3: Payments** (45 min)
   - Stripe payment flow
   - PayPal order creation
   - Webhook verification

4. **Phase 4: Edge Cases** (30 min)
   - Invalid inputs
   - API rate limits
   - Network timeouts
   - Concurrent requests

---

## Success Metrics

- ✅ All critical paths (Auth, Payments, Events) working
- ✅ Error handling returning meaningful messages
- ✅ Webhooks processing within 5 seconds
- ✅ No database conflicts or race conditions
- ✅ API rate limits respected
- ✅ Security validations passing (CSRF, signature verification)

---

## Debugging Tips

```bash
# Check live logs
railway logs -f

# Test API endpoint directly
curl -v https://staging-api.djdannyhecticb.com/api/trpc/events.upcoming

# Verify environment variables
railway variables

# Check database connectivity
railway run npm run db:check

# Monitor webhook deliveries (check provider dashboards)
# Stripe: https://dashboard.stripe.com/webhooks
# Ticketmaster: Developer portal webhook logs
# YouTube: Cloud Console Activity Log
```

---

## Sign-Off

- [ ] All Phase 1 tests passing
- [ ] All Phase 2 tests passing
- [ ] All Phase 3 tests passing
- [ ] All Phase 4 tests passing
- [ ] Ready for production deployment
