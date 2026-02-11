#!/usr/bin/env bash
#
# INSTANT DEPLOYMENT SCRIPT
# Server-authoritative deployment triggered by GitHub webhooks
#
# Location: /opt/djdannyhecticb/deploy.sh
# Permissions: chmod +x /opt/djdannyhecticb/deploy.sh
# Owner: deploy user (with Docker access)
#

set -e  # Exit on any error
set -o pipefail  # Catch pipe failures

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CONFIGURATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

APP_DIR="${APP_DIR:-/var/www/djdannyhecticb}"
LOG_FILE="${LOG_FILE:-/var/log/djdannyhecticb-deploy.log}"
HEALTH_URL="${HEALTH_URL:-https://djdannyhecticb.com/api/health}"
MAX_RETRIES=3
RETRY_DELAY=5

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LOGGING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" | tee -a "$LOG_FILE" >&2
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DEPLOYMENT START
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🚀 INSTANT DEPLOY TRIGGERED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

START_TIME=$(date +%s)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 1: GIT PULL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log "📥 Step 1/6: Pulling latest code..."

cd "$APP_DIR" || {
    error "Failed to change to app directory: $APP_DIR"
    exit 1
}

CURRENT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
log "   Current commit: $CURRENT_COMMIT"

git fetch origin main || {
    error "Git fetch failed"
    exit 1
}

git reset --hard origin/main || {
    error "Git reset failed"
    exit 1
}

NEW_COMMIT=$(git rev-parse --short HEAD)
log "   New commit: $NEW_COMMIT"

if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
    log "   ⚠️  No new commits (already up to date)"
else
    log "   ✅ Updated: $CURRENT_COMMIT → $NEW_COMMIT"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 2: INSTALL DEPENDENCIES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log "📦 Step 2/6: Installing dependencies..."

if ! command -v pnpm &> /dev/null; then
    error "pnpm not found. Install with: npm install -g pnpm"
    exit 1
fi

pnpm install --frozen-lockfile || {
    error "Dependency installation failed"
    exit 1
}

log "   ✅ Dependencies installed"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 3: BUILD APPLICATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log "🏗️  Step 3/6: Building application..."

pnpm build || {
    error "Build failed"
    exit 1
}

log "   ✅ Build complete"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 4: RESTART DOCKER CONTAINERS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log "🐳 Step 4/6: Restarting Docker containers..."

if ! command -v docker &> /dev/null; then
    error "Docker not found"
    exit 1
fi

# Graceful shutdown
docker compose down --timeout 30 || {
    error "Docker compose down failed"
    exit 1
}

# Rebuild and start
docker compose up -d --build || {
    error "Docker compose up failed"
    exit 1
}

log "   ✅ Docker containers restarted"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 5: WAIT FOR STARTUP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log "⏳ Step 5/6: Waiting for services to start..."

sleep 10

log "   ✅ Services should be ready"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 6: HEALTH CHECK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log "🏥 Step 6/6: Running health check..."

for attempt in $(seq 1 $MAX_RETRIES); do
    if curl -fsS "$HEALTH_URL" 2>/dev/null | grep -qi "ok"; then
        log "   ✅ Health check passed (attempt $attempt/$MAX_RETRIES)"
        break
    fi
    
    if [ "$attempt" -lt "$MAX_RETRIES" ]; then
        log "   ⏳ Health check failed, retrying in ${RETRY_DELAY}s (attempt $attempt/$MAX_RETRIES)..."
        sleep $RETRY_DELAY
    else
        error "Health check failed after $MAX_RETRIES attempts"
        error "URL: $HEALTH_URL"
        error "Deployment may have issues. Check logs and containers."
        exit 1
    fi
done

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DEPLOYMENT COMPLETE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅ DEPLOYMENT SUCCESSFUL"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Commit: $NEW_COMMIT"
log "Duration: ${DURATION}s"
log "URL: https://djdannyhecticb.com"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit 0
