# 🎧 DJ Danny Hectic B - Quick Start Guide

## What You Have Now

A **complete, production-ready** DJ platform with:
- ✅ Payment processing (Stripe)
- ✅ Email automation (Resend)  
- ✅ AI features (OpenAI, ElevenLabs, Replicate)
- ✅ Cloud storage (AWS S3)
- ✅ Analytics (PostHog, Sentry)
- ✅ Social media APIs (Spotify, YouTube, etc.)
- ✅ Database with seeding
- ✅ Docker deployment
- ✅ Production configs

## 🚀 Get Started in 5 Minutes

### Option 1: Automated Setup

```bash
./setup.sh
```

This script will:
1. Check prerequisites
2. Install dependencies
3. Create .env file
4. Guide you through configuration

### Option 2: Manual Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
nano .env  # Add your API keys

# 3. Setup database
pnpm db:push      # Run migrations
pnpm db:seed      # Add initial data

# 4. Start development
pnpm dev
```

## 🔑 Required API Keys

Get these (all have free tiers):

1. **Database** (Choose one):
   - Local MySQL: Free
   - [PlanetScale](https://planetscale.com): Free tier
   - [Railway](https://railway.app): $5/month

2. **Payment** (Optional but recommended):
   - [Stripe](https://stripe.com): Free + transaction fees
   
3. **Email** (Optional but recommended):
   - [Resend](https://resend.com): 100 emails/day free

4. **AI Features** (Optional):
   - [OpenAI](https://platform.openai.com): $5 credit free
   - [ElevenLabs](https://elevenlabs.io): 10k chars/month free
   - [Replicate](https://replicate.com): Pay per use

5. **Storage** (Optional):
   - [AWS S3](https://aws.amazon.com/s3): 5GB free

## ⚙️ Minimum Configuration

For basic functionality, you only need:

```env
# Database
DATABASE_URL=mysql://user:pass@host:3306/db

# OAuth (if using Manus)
OAUTH_SERVER_URL=http://localhost:3000
APP_ID=your-app-id
JWT_SECRET=random-secret-here
```

The app will run with graceful degradation for missing services.

## 📝 Configuration Cheat Sheet

### Local Development
```env
DATABASE_URL=mysql://root:password@localhost:3306/djdannyhecticb
OAUTH_SERVER_URL=http://localhost:3000
APP_ID=dj-danny-hectic-b-dev
JWT_SECRET=dev-secret-change-in-production
NODE_ENV=development
PORT=3000
```

### Production
```env
DATABASE_URL=mysql://user:pass@prod-host:3306/db
OAUTH_SERVER_URL=https://yourdomain.com
APP_ID=dj-danny-hectic-b-prod
JWT_SECRET=long-random-secure-secret
NODE_ENV=production
PORT=3000

# Add your real API keys for:
STRIPE_SECRET_KEY=sk_live_xxxxx
RESEND_API_KEY=re_xxxxx
OPENAI_API_KEY=sk-proj-xxxxx
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
```

## 🏃 Running the Application

### Development Mode
```bash
pnpm dev
# Opens on http://localhost:3000
```

### Production Mode
```bash
pnpm build
pnpm start
```

### With Docker
```bash
docker-compose up -d
docker-compose logs -f app
```

## 🧪 Testing Features

### 1. Homepage
Visit `http://localhost:3000` - should see hero, player, shout form

### 2. Send a Shout
Fill out shout form → Check database → Approve in admin panel

### 3. Admin Panel
Visit `/admin/shouts` → Manage shouts, streams, tracks

### 4. Payment (if Stripe configured)
Visit `/support` → Test payment with card `4242 4242 4242 4242`

### 5. AI Chat (if OpenAI configured)
Click AI chat button → Ask "What's playing?"

## 📂 Project Structure

```
djdannyhecticb/
├── client/               # Frontend React app
│   └── src/
│       ├── pages/        # Route pages
│       ├── components/   # UI components
│       └── lib/          # Utils (trpc, etc.)
├── server/               # Backend Express app
│   ├── _core/            # Core services
│   │   ├── payments.ts   # Stripe integration
│   │   ├── email.ts      # Resend integration
│   │   ├── aiProviders.ts# AI services
│   │   ├── storage.ts    # S3 integration
│   │   ├── analytics.ts  # PostHog/Sentry
│   │   └── integrations.ts# Social APIs
│   ├── db.ts             # Database functions
│   └── routers.ts        # tRPC routes
├── drizzle/              # Database schema
├── .env                  # Your config (create this!)
├── docker-compose.yml    # Docker setup
├── setup.sh              # Automated setup
└── DEPLOYMENT.md         # Production guide
```

## 🐛 Troubleshooting

### Database connection fails
```bash
# Test MySQL connection
mysql -h localhost -u root -p

# Check .env DATABASE_URL format
# Should be: mysql://user:pass@host:port/database
```

### Port already in use
```bash
# Change PORT in .env
PORT=3001

# Or kill process on port 3000
lsof -ti:3000 | xargs kill
```

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules .pnpm-store dist
pnpm install
pnpm build
```

### AI features not working
- Check API keys in .env
- Verify keys are prefixed correctly (OPENAI_API_KEY, ELEVENLABS_API_KEY)
- Check API quota/limits

## 🎯 Next Steps

1. **Customize Branding**
   - Update `VITE_APP_TITLE` and `VITE_APP_LOGO`
   - Edit colors in `client/src/index.css`

2. **Add Content**
   - Upload mixes via admin panel
   - Configure stream URLs
   - Add events and shows

3. **Enable Payments**
   - Get Stripe keys
   - Test with test cards
   - Configure products/tiers

4. **Set Up Email**
   - Get Resend API key
   - Verify domain
   - Test email sending

5. **Deploy to Production**
   - Follow `DEPLOYMENT.md`
   - Configure DNS
   - Set up SSL
   - Monitor with Sentry

## 📚 Documentation

- **README.md** - Full getting started guide
- **DEPLOYMENT.md** - Production deployment
- **IMPLEMENTATION_SUMMARY.md** - What was implemented
- **docs/** - Architecture, playbooks, features

## 💬 Support

If something's not working:
1. Check the troubleshooting section above
2. Review error logs: `pnpm dev` output
3. Check database: `mysql -u root -p`
4. Verify .env configuration

## 🎉 You're Ready!

Everything is implemented and ready to go. Just add your API keys and start spinning! 🔥

```bash
./setup.sh  # Run this now!
```
