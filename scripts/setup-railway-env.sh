#!/usr/bin/env bash
# One-time setup: sets Railway env vars, grabs the domain, updates vercel.json,
# and stores GitHub secrets — all without any manual dashboard work.
#
# Requires: railway CLI, gh CLI (both authenticated via your browser/token)
# Run: bash scripts/setup-railway-env.sh

set -euo pipefail

PROJECT_ID="4d44136f-d1b3-4336-9926-1f2463651991"
ENVIRONMENT="production"
SERVICE="web"
REPO="richhabits/djdannyhecticb"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}▶${NC} $*"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $*"; }
die()   { echo -e "${RED}✗${NC} $*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# 1. Ensure CLIs
# ---------------------------------------------------------------------------
command -v railway >/dev/null 2>&1 || { info "Installing Railway CLI..."; npm install -g @railway/cli; }
command -v gh      >/dev/null 2>&1 || die "gh CLI not found. Install from https://cli.github.com and run 'gh auth login' first."
command -v jq      >/dev/null 2>&1 || die "jq not found. Install it (brew install jq / apt install jq)."
command -v openssl >/dev/null 2>&1 || die "openssl not found."

# ---------------------------------------------------------------------------
# 2. Railway login (opens browser if not already logged in)
# ---------------------------------------------------------------------------
if ! railway whoami >/dev/null 2>&1; then
  info "Logging into Railway (a browser window will open)..."
  railway login
fi
info "Railway auth OK ($(railway whoami))"

# ---------------------------------------------------------------------------
# 3. DATABASE_URL
# ---------------------------------------------------------------------------
echo ""
echo "Paste your Neon DATABASE_URL and press Enter (input is hidden):"
echo "  postgresql://neondb_owner:...@...neon.tech/neondb?sslmode=require..."
read -r -s DATABASE_URL
echo ""
[[ "$DATABASE_URL" == postgresql://* ]] || die "DATABASE_URL must start with postgresql://"

# ---------------------------------------------------------------------------
# 4. Generate JWT_SECRET (64 chars, satisfies server/env.ts validation)
# ---------------------------------------------------------------------------
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n/+=' | head -c 64)
# Ensure it has at least one uppercase and one digit (base64 charset guarantees it,
# but add a forced suffix just in case the tr trimming removed them)
JWT_SECRET="${JWT_SECRET:0:62}A9"
info "Generated JWT_SECRET"

# ---------------------------------------------------------------------------
# 5. Set variables on Railway
# ---------------------------------------------------------------------------
info "Setting Railway environment variables..."
railway variable set \
  "JWT_SECRET=$JWT_SECRET" \
  NODE_ENV=production \
  "CORS_ORIGINS=https://djdannyhecticb.com,https://www.djdannyhecticb.com,https://djdannyhectic.com" \
  -s "$SERVICE" -e "$ENVIRONMENT" -p "$PROJECT_ID" --skip-deploys

# DATABASE_URL contains special chars — pipe via stdin to avoid shell escaping issues
echo -n "$DATABASE_URL" | railway variable set DATABASE_URL --stdin \
  -s "$SERVICE" -e "$ENVIRONMENT" -p "$PROJECT_ID" --skip-deploys

info "Variables set."

# ---------------------------------------------------------------------------
# 6. Ensure public domain exists and capture it
# ---------------------------------------------------------------------------
info "Fetching Railway domain..."
DOMAIN_JSON=$(railway domain -s "$SERVICE" -e "$ENVIRONMENT" --project "$PROJECT_ID" --json 2>/dev/null || echo '{}')
DOMAIN=$(echo "$DOMAIN_JSON" | jq -r '.domain // .url // empty' 2>/dev/null)

if [[ -z "$DOMAIN" ]]; then
  warn "Could not auto-detect domain. Using fallback: web-production-a440b.up.railway.app"
  DOMAIN="web-production-a440b.up.railway.app"
fi
info "Railway domain: $DOMAIN"

# ---------------------------------------------------------------------------
# 7. Trigger a deploy (env vars now set)
# ---------------------------------------------------------------------------
info "Triggering Railway redeploy..."
railway redeploy -s "$SERVICE" -e "$ENVIRONMENT" -p "$PROJECT_ID" -y || warn "Redeploy may need to run manually — check Railway dashboard."

# ---------------------------------------------------------------------------
# 8. Update vercel.json with confirmed domain
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VERCEL_JSON="$REPO_ROOT/vercel.json"

CURRENT_DOMAIN=$(jq -r '.rewrites[0].destination' "$VERCEL_JSON" 2>/dev/null | sed 's|https://||' | sed 's|/api/.*||' || echo "")

if [[ "$CURRENT_DOMAIN" != "$DOMAIN" ]]; then
  info "Updating vercel.json: $CURRENT_DOMAIN → $DOMAIN"
  jq --arg d "https://$DOMAIN" '
    .rewrites[0].destination = ($d + "/api/$1")
  ' "$VERCEL_JSON" > /tmp/vercel.json.tmp && mv /tmp/vercel.json.tmp "$VERCEL_JSON"
else
  info "vercel.json already points to $DOMAIN — no change needed."
fi

# ---------------------------------------------------------------------------
# 9. Store GitHub secrets (RAILWAY_DATABASE_URL + RAILWAY_TOKEN)
# ---------------------------------------------------------------------------
info "Storing GitHub secrets..."

# DATABASE_URL
echo -n "$DATABASE_URL" | gh secret set RAILWAY_DATABASE_URL -R "$REPO" --body -
info "  RAILWAY_DATABASE_URL set."

# Extract Railway personal token from CLI config (avoids dashboard token creation)
RAILWAY_CFG="${XDG_CONFIG_HOME:-$HOME/.config}/railway/config.toml"
if [[ -f "$RAILWAY_CFG" ]]; then
  RAW_TOKEN=$(grep -E '^\s*token\s*=' "$RAILWAY_CFG" | head -1 | sed 's/.*=\s*"\(.*\)"/\1/')
  if [[ -n "$RAW_TOKEN" ]]; then
    echo -n "$RAW_TOKEN" | gh secret set RAILWAY_TOKEN -R "$REPO" --body -
    info "  RAILWAY_TOKEN set (from ~/.config/railway/config.toml)."
  else
    warn "  Could not extract RAILWAY_TOKEN from config. Manually set it in GitHub secrets later."
  fi
else
  warn "  Railway config not found at $RAILWAY_CFG. Manually set RAILWAY_TOKEN in GitHub secrets."
fi

# ---------------------------------------------------------------------------
# 10. Commit + push vercel.json if changed
# ---------------------------------------------------------------------------
cd "$REPO_ROOT"
if ! git diff --quiet vercel.json 2>/dev/null; then
  info "Committing updated vercel.json..."
  git add vercel.json
  git commit -m "fix: update API proxy domain to confirmed Railway URL ($DOMAIN)"
  git push
  info "Pushed. Vercel will redeploy automatically."
else
  info "vercel.json unchanged — no commit needed."
fi

# ---------------------------------------------------------------------------
echo ""
echo -e "${GREEN}✓ Done!${NC}"
echo "  Railway backend:  https://$DOMAIN"
echo "  Health check:     https://$DOMAIN/api/health"
echo "  Frontend (after Vercel deploys):  https://djdannyhecticb.com"
echo ""
echo "Watch the Railway deploy at: https://railway.app/project/$PROJECT_ID"
