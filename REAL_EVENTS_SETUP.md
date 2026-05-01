# Real Events Setup Guide

All real events are now integrated and live. Follow this guide to activate them.

## 1. Stripe Donations (Already Configured ✅)

**Status:** Active - Webhook already set up in Vercel

Donations via Stripe automatically trigger live alerts:
- Charge received → `broadcastStreamEvent("donation")`
- New subscription → `broadcastStreamEvent("subscribe")`

**Webhook URL:** `https://djdannyhecticb.com/api/stripe/webhook`
**Environment Variables:** Already in Vercel
- ✅ STRIPE_SECRET_KEY
- ✅ STRIPE_WEBHOOK_SECRET
- ✅ STRIPE_PUBLISHABLE_KEY

### To Add Stripe Price IDs (for tier mapping):

```bash
# Get your Stripe price IDs from https://dashboard.stripe.com/prices

vercel env add STRIPE_PRICE_BRONZE production
# Paste: price_1SmIYR2HkyKRVyFU1bwXXdgZ...

vercel env add STRIPE_PRICE_SILVER production
# Paste: price_1SmIYR2HkyKRVyFU1...

vercel env add STRIPE_PRICE_GOLD production
# Paste: price_1SmIYR2HkyKRVyFU1...

vercel env add STRIPE_PRICE_PLATINUM production
# Paste: price_1SmIYR2HkyKRVyFU1...
```

---

## 2. Ticketmaster Events (Ready to Activate)

**Status:** Ready - Just need API key

Shows upcoming concerts, shows, events in live page sidebar.

### Get Ticketmaster API Key:

1. Go to: https://developer.ticketmaster.com
2. Sign up / Log in
3. Create an application
4. Copy your **Consumer Key**

### Add to Vercel:

```bash
vercel env add TICKETMASTER_API_KEY production
# Paste your Consumer Key
```

### Test:

```bash
curl https://djdannyhecticb.com/api/ticketmaster/events
curl https://djdannyhecticb.com/api/ticketmaster/events/upcoming
```

---

## 3. YouTube Events (Ready to Activate)

**Status:** Ready - Just need API key

Tracks subscriber count, broadcasts follows to live viewers.

### Get YouTube API Key:

1. Go to: https://console.cloud.google.com
2. Create a new project
3. Enable **YouTube Data API v3**
4. Create an **API Key** credential
5. Copy the key

### Add to Vercel:

```bash
vercel env add YOUTUBE_API_KEY production
# Paste your API Key
```

### Test:

```bash
# Get channel stats
curl "https://djdannyhecticb.com/api/youtube/channel/UCxxxxx/subscribers"

# Broadcast a follow (for testing)
curl -X POST https://djdannyhecticb.com/api/youtube/event/follow \
  -H "Content-Type: application/json" \
  -d '{"username":"TestUser"}'
```

---

## 4. Event Flow Diagram

```
Real Event Source
       ↓
API Endpoint / Webhook
       ↓
broadcastStreamEvent()
       ↓
WebSocket (ws://live)
       ↓
useStreamEvents hook
       ↓
Alert Component (RaidAlert, SubscriberAlert, DonationAlert)
       ↓
Viewer Sees Alert 🎉
```

---

## 5. Available Event Types

### Stripe
- `donation` - Charge succeeded
  - Data: `{username, amount, message}`
- `subscribe` - New subscription
  - Data: `{username, tier, months, message}`

### Ticketmaster
- `event` - Concert/show displayed in sidebar
  - Data: `{name, date, venue, city, url, image, price}`

### YouTube
- `follow` - Channel follow/subscribe
  - Data: `{username}`

---

## 6. Live Testing

### Trigger a Donation Alert:
```bash
curl -X POST https://djdannyhecticb.com/api/stream/event/donation \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TestDonor",
    "amount": 25,
    "message": "Amazing stream!"
  }'
```

### Trigger a Raid Alert:
```bash
curl -X POST https://djdannyhecticb.com/api/stream/event/raid \
  -H "Content-Type: application/json" \
  -d '{
    "username": "PopularStreamer",
    "raidCount": 500
  }'
```

### Trigger a Subscribe Alert:
```bash
curl -X POST https://djdannyhecticb.com/api/stream/event/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "username": "NewSubscriber",
    "tier": "gold",
    "months": 1,
    "message": "Love your streams!"
  }'
```

---

## 7. Deployment Checklist

- [ ] Add TICKETMASTER_API_KEY to Vercel
- [ ] Add YOUTUBE_API_KEY to Vercel
- [ ] Add STRIPE_PRICE_* IDs to Vercel
- [ ] Test Stripe webhook: Send test charge in Stripe Dashboard
- [ ] Test Ticketmaster: Visit live page, check sidebar for events
- [ ] Test YouTube: Manually trigger follow alert with curl
- [ ] Monitor logs in Vercel dashboard

---

## 8. Monitoring

### View logs:
```bash
vercel logs djdannyhecticb
```

### Events broadcast to console:
```
✅ Stream client connected. Total: 5
💰 Donation received: TestDonor - $25
🎁 New subscriber: NewSubscriber
✅ Stream events connected
```

---

## 9. Environment Variables Summary

| Variable | Required | Source | Purpose |
|----------|----------|--------|---------|
| STRIPE_SECRET_KEY | ✅ Yes | Stripe Dashboard | Process donations |
| STRIPE_WEBHOOK_SECRET | ✅ Yes | Stripe Dashboard | Verify webhook signatures |
| STRIPE_PUBLISHABLE_KEY | ✅ Yes | Stripe Dashboard | Frontend Stripe integration |
| STRIPE_PRICE_BRONZE | ❌ Optional | Stripe Dashboard | Map price to tier |
| STRIPE_PRICE_SILVER | ❌ Optional | Stripe Dashboard | Map price to tier |
| STRIPE_PRICE_GOLD | ❌ Optional | Stripe Dashboard | Map price to tier |
| STRIPE_PRICE_PLATINUM | ❌ Optional | Stripe Dashboard | Map price to tier |
| TICKETMASTER_API_KEY | ❌ Optional | Ticketmaster Developer | Fetch events |
| YOUTUBE_API_KEY | ❌ Optional | Google Cloud Console | Get channel stats |

---

## 10. Troubleshooting

### Stripe webhook not firing?
- Check webhook endpoint in Stripe Dashboard: https://dashboard.stripe.com/webhooks
- Verify STRIPE_WEBHOOK_SECRET matches Stripe signing secret
- Send test event from Stripe Dashboard

### Ticketmaster events not showing?
- Verify API key is correct
- Check rate limits: https://developer.ticketmaster.com/docs/read/getting_started
- API free tier: 5,000 requests/day

### YouTube API not working?
- Enable YouTube Data API v3 in Google Cloud Console
- Check API key has no restrictions
- Verify channel ID format

### Donations not triggering alerts?
- Check Stripe webhook is hitting Vercel (logs → Stripe Dashboard)
- Verify database STRIPE_WEBHOOK_SECRET matches webhook secret
- Manually test with curl command above

---

**Status:** Production Ready  
**Last Updated:** 2026-05-01  
**Next Step:** Deploy to Vercel and add API keys
