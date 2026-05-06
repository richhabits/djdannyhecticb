# Railway Environment Variables Template

## How to Use This Document

1. Open your password manager or .env file
2. Find each value listed below
3. Paste into Railway dashboard → Variables tab
4. Each variable is one line in the format: `KEY=VALUE`

---

## Required Variables (MUST SET)

### Node Environment
```
NODE_ENV=production
```

### Database (PostgreSQL via Neon)
```
DATABASE_URL=postgresql://neondb_owner:npg_z5oIdPSA2Oxk@ep-divine-leaf-abpjfgjl-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
*Note: Replace with your actual Neon connection string if different*

### JWT Authentication
```
JWT_SECRET=your-strong-secret-minimum-32-characters-long-change-this-to-random-value
```
**Generate with**: `openssl rand -hex 32`

### Google OAuth
```
GOOGLE_CLIENT_ID=223520511634-plit8kpi986o5vhleoadlmfs7bpa92h3.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

---

## Commerce Variables (Payment Processing)

### Stripe
```
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_STRIPE_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_STRIPE_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET_HERE
```
**Get from**: Stripe Dashboard → Keys & Webhooks

### PayPal
```
PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_PAYPAL_CLIENT_SECRET
PAYPAL_MODE=live
```
**Get from**: PayPal Developer Dashboard → My Apps & Credentials

---

## Communication Variables

### Email Service (SendGrid Recommended)
```
EMAIL_SERVICE_PROVIDER=sendgrid
EMAIL_API_KEY=SG.YOUR_ACTUAL_SENDGRID_API_KEY_HERE
EMAIL_FROM_ADDRESS=noreply@djdannyhectic.com
NOTIFICATIONS_EMAIL=alerts@djdannyhectic.com
```
**Get from**: SendGrid Dashboard → Settings → API Keys

**Alternative (Resend)**:
```
EMAIL_SERVICE_PROVIDER=resend
EMAIL_API_KEY=re_YOUR_ACTUAL_RESEND_API_KEY_HERE
```

---

## Frontend Integration

### CORS Origins (Allow Frontend)
```
CORS_ORIGINS=https://djdannyhecticb.vercel.app,https://djdannyhectic.com
```
*Add Vercel URL and any production domains here*

---

## Streaming Platforms (Optional)

### YouTube
```
YOUTUBE_DATA_API_KEY=AIzaSyBGSh5G9yb8h5mOopY2VgQM4ZXe5cCYkq8
YOUTUBE_CHANNEL_ID=UC72QyiDSnHnJAGXT0xyuCWA
```
**Get from**: Google Cloud Console → APIs & Services → YouTube Data API

### Twitch
```
TWITCH_CLIENT_ID=6j2q6mwwjtxn2l1sfnux1hp6yxgumt
TWITCH_CLIENT_SECRET=fiv5vbp5j3eu3izmfl3ox6rvcilcy
TWITCH_CHANNEL_NAME=djdannyhecticb
```
**Get from**: Twitch Creator Dashboard → Settings → Connections

---

## AI & Analytics (Optional)

### Google AI (Gemini)
```
GOOGLE_AI_API_KEY=AIzaSyBGSh5G9yb8h5mOopY2VgQM4ZXe5cCYkq8
GEMINI_MODEL=gemini-1.5-flash
```
**Get from**: Google AI Studio → API Keys

### Groq (Fast Inference - Free)
```
GROQ_API_KEY=YOUR_GROQ_API_KEY
GROQ_MODEL=llama-3.1-8b-instant
```
**Get from**: https://console.groq.com/keys

### Cohere (NLP - Free Tier)
```
COHERE_API_KEY=YOUR_COHERE_API_KEY
COHERE_MODEL=command
```
**Get from**: https://dashboard.cohere.com/api-keys

### Ticketmaster (Events)
```
TICKETMASTER_API_KEY=HoaPBhMHhjI2Lszbd5fv1Zp05OG5HIrY
```
**Get from**: Ticketmaster Developer Portal → My Applications

---

## Caching (Optional but Recommended)

### Redis
```
REDIS_URL=redis://user:password@host:port
REDIS_HOST=redis-host.com
REDIS_PORT=6379
```
*Skip if using in-memory caching (slower but free)*

---

## Music Platform Integration (Optional)

### Spotify
```
SPOTIFY_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET=YOUR_SPOTIFY_CLIENT_SECRET
SPOTIFY_ARTIST_ID=YOUR_ARTIST_ID
```
**Get from**: Spotify Developer Dashboard → Apps

### SoundCloud
```
SOUNDCLOUD_CLIENT_ID=YOUR_SOUNDCLOUD_CLIENT_ID
SOUNDCLOUD_USER_ID=YOUR_USER_ID
```

### Beatport
```
BEATPORT_PROFILE_URL=https://www.beatport.com/artist/your-name
```

---

## Admin Configuration (Optional)

### Admin Emails
```
ADMIN_EMAILS=djdannyhecticb@gmail.com
```
*Comma-separated list of emails that get auto-admin role*

### Contact Info
```
PHONE_NUMBER=07957 432842
INSTAGRAM_HANDLE=djdannyhecticb
```

---

## Print-on-Demand (Optional)

### Printfull Integration
```
PRINTFULL_API_KEY=YOUR_PRINTFULL_API_KEY
```
**Get from**: Printfull Dashboard → Settings → API

---

## Copy-Paste Template (Quick Setup)

```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_z5oIdPSA2Oxk@ep-divine-leaf-abpjfgjl-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=CHANGE_ME_TO_RANDOM_32_CHARS_MIN
GOOGLE_CLIENT_ID=223520511634-plit8kpi986o5vhleoadlmfs7bpa92h3.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
STRIPE_SECRET_KEY=sk_live_CHANGE_ME
STRIPE_PUBLISHABLE_KEY=pk_live_CHANGE_ME
STRIPE_WEBHOOK_SECRET=whsec_CHANGE_ME
PAYPAL_CLIENT_ID=CHANGE_ME
PAYPAL_CLIENT_SECRET=CHANGE_ME
PAYPAL_MODE=live
EMAIL_SERVICE_PROVIDER=sendgrid
EMAIL_API_KEY=SG.CHANGE_ME
EMAIL_FROM_ADDRESS=noreply@djdannyhectic.com
NOTIFICATIONS_EMAIL=alerts@djdannyhectic.com
CORS_ORIGINS=https://djdannyhecticb.vercel.app,https://djdannyhectic.com
YOUTUBE_DATA_API_KEY=AIzaSyBGSh5G9yb8h5mOopY2VgQM4ZXe5cCYkq8
YOUTUBE_CHANNEL_ID=UC72QyiDSnHnJAGXT0xyuCWA
TWITCH_CLIENT_ID=6j2q6mwwjtxn2l1sfnux1hp6yxgumt
TWITCH_CLIENT_SECRET=fiv5vbp5j3eu3izmfl3ox6rvcilcy
TWITCH_CHANNEL_NAME=djdannyhecticb
GOOGLE_AI_API_KEY=AIzaSyBGSh5G9yb8h5mOopY2VgQM4ZXe5cCYkq8
GEMINI_MODEL=gemini-1.5-flash
TICKETMASTER_API_KEY=HoaPBhMHhjI2Lszbd5fv1Zp05OG5HIrY
ADMIN_EMAILS=djdannyhecticb@gmail.com
PHONE_NUMBER=07957 432842
INSTAGRAM_HANDLE=djdannyhecticb
```

---

## How to Add to Railway

### Method 1: Web Dashboard (Easiest)
1. Go to https://railway.app/dashboard
2. Select your project
3. Click **"Variables"** tab
4. Click **"+ New Variable"**
5. Paste each line from the template above
6. Format: `KEY=VALUE`
7. Click **"+ Add"** for each one

### Method 2: Railway CLI
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Add variables
railway variables set NODE_ENV=production
railway variables set DATABASE_URL="postgresql://..."
# ... repeat for each variable
```

### Method 3: .railway.toml (Advanced)
Create `.railway.toml` in repo root with all variables (but this commits secrets, don't use).

---

## Validation Checklist

Before saving, verify:

- [ ] `JWT_SECRET` is at least 32 characters
- [ ] `DATABASE_URL` starts with `postgresql://`
- [ ] `STRIPE_SECRET_KEY` starts with `sk_live_` (not `sk_test_`)
- [ ] `PAYPAL_MODE` is `live` (not `sandbox`)
- [ ] `GOOGLE_CLIENT_SECRET` is not empty
- [ ] No trailing spaces on any values
- [ ] All quotes are removed (just `KEY=VALUE`)

---

## Security Notes

⚠️ **Never commit these variables to Git**
- Railway automatically hides them in logs
- But never paste into code files
- Always use environment variables
- Rotate secrets regularly

✅ **Safe practices**:
- Use Railway dashboard only
- Never share URL with variables exposed
- Use strong JWT_SECRET (min 32 chars)
- Regenerate secrets if compromised
- Use production keys (sk_live_*, not sk_test_*)

---

## Getting Each Secret

| Secret | Where to Find | Cost | Time |
|--------|---------------|------|------|
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → APIs | Free | 2 min |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Keys | Free | 1 min |
| `PAYPAL_*` | PayPal Developer App | Free | 5 min |
| `EMAIL_API_KEY` | SendGrid → API Keys | Free (100/day) | 3 min |
| `JWT_SECRET` | Generate new: `openssl rand -hex 32` | Free | 1 sec |
| Database URL | Neon Dashboard | Free | Already set |

---

## Minimal Setup (For Testing)

If you don't have all secrets yet, minimum required:

```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_z5oIdPSA2Oxk@ep-divine-leaf-abpjfgjl-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=test-secret-minimum-32-characters-long-1234567890
GOOGLE_CLIENT_ID=223520511634-plit8kpi986o5vhleoadlmfs7bpa92h3.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
CORS_ORIGINS=https://djdannyhecticb.vercel.app
```

This allows:
✓ Server to start
✓ Database connection
✓ Authentication
✓ Frontend communication

But disables:
✗ Stripe payments
✗ Email notifications
✗ PayPal checkout
✗ Streaming integrations

---

## Need Help?

1. Check `RAILWAY_DEPLOYMENT_GUIDE.md` for troubleshooting
2. Check `RAILWAY_QUICK_START.md` for quick reference
3. Check `RAILWAY_DEPLOYMENT_STATUS.md` for status
4. Railway docs: https://docs.railway.app/deploy/environment-variables

---

**Last Updated**: 2026-05-05
**Status**: Ready for production deployment
