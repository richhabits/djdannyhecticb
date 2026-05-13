#!/bin/bash
set -e

echo "🚀 MAIN LINE (PROVISIONS) — Railway Setup"
echo "=========================================="
echo ""

# Check prerequisites
command -v railway &> /dev/null || {
  echo "❌ Railway CLI not found. Installing..."
  npm install -g @railway/cli
}

echo "✅ Railway CLI found"
echo ""

# Login
echo "🔑 Logging in to Railway..."
railway login
echo "✅ Logged in"
echo ""

# Link project
echo "📌 Linking to Railway project..."
railway link
echo "✅ Project linked"
echo ""

# Prompt for environment variables
echo "📝 Setting environment variables..."
echo "Copy values from your Supabase dashboard and .env file"
echo ""

read -p "NEXT_PUBLIC_SUPABASE_URL: " NEXT_PUBLIC_SUPABASE_URL
read -p "NEXT_PUBLIC_SUPABASE_ANON_KEY: " NEXT_PUBLIC_SUPABASE_ANON_KEY
read -p "SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_ROLE_KEY
read -p "NEXT_PUBLIC_GTM_ID (GTM-PDPRMZJB): " NEXT_PUBLIC_GTM_ID
read -p "NEXT_PUBLIC_TURNSTILE_SITE_KEY: " NEXT_PUBLIC_TURNSTILE_SITE_KEY
read -p "TURNSTILE_SECRET_KEY: " TURNSTILE_SECRET_KEY
read -p "RESEND_API_KEY: " RESEND_API_KEY
read -p "FROM_EMAIL: " FROM_EMAIL
read -p "UPSTASH_REDIS_REST_URL: " UPSTASH_REDIS_REST_URL
read -p "UPSTASH_REDIS_REST_TOKEN: " UPSTASH_REDIS_REST_TOKEN

echo ""
echo "Setting variables in Railway..."
railway variables set \
  NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  NEXT_PUBLIC_GTM_ID="$NEXT_PUBLIC_GTM_ID" \
  NEXT_PUBLIC_TURNSTILE_SITE_KEY="$NEXT_PUBLIC_TURNSTILE_SITE_KEY" \
  TURNSTILE_SECRET_KEY="$TURNSTILE_SECRET_KEY" \
  RESEND_API_KEY="$RESEND_API_KEY" \
  FROM_EMAIL="$FROM_EMAIL" \
  UPSTASH_REDIS_REST_URL="$UPSTASH_REDIS_REST_URL" \
  UPSTASH_REDIS_REST_TOKEN="$UPSTASH_REDIS_REST_TOKEN"

echo "✅ Variables set"
echo ""

# Get Railway token for GitHub
echo "🔐 Getting Railway token for GitHub..."
TOKEN=$(railway token)
echo ""
echo "Add this to GitHub Secrets (Settings → Secrets → New repository secret):"
echo "  Name: RAILWAY_TOKEN"
echo "  Value: $TOKEN"
echo ""

# Get domain for GitHub
echo "📍 Getting Railway domain..."
DOMAIN=$(railway open --browser=false 2>/dev/null | grep -oP '(?<=https://).*?(?=/|$)' || echo "your-domain.railway.app")
echo ""
echo "Add this to GitHub Secrets:"
echo "  Name: RAILWAY_DOMAIN"
echo "  Value: $DOMAIN"
echo ""

# Deploy
read -p "Deploy to Railway now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🚀 Deploying to Railway..."
  railway up
  echo "✅ Deployment started"
  echo ""
  echo "Monitor deployment:"
  echo "  railway logs"
  echo "  railway open"
else
  echo "Deploy later with: railway up"
fi

echo ""
echo "✅ Railway setup complete!"
