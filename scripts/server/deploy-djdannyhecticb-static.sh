#!/usr/bin/env bash
set -euo pipefail

# ====== Enterprise-Grade Deployment Script ======
# Features:
# - Deploy lock (prevent parallel builds)
# - Auto-prune old releases (keep last 5)
# - Health check file generation
# - Structured logging
# - Fail-fast validation

APP_ROOT="/srv/djdannyhecticb"
REPO_DIR="$APP_ROOT/repo"
RELEASES="$APP_ROOT/releases"
LOG_DIR="/var/log/djdannyhecticb"
LOCK_FILE="/var/lock/djdannyhecticb-deploy.lock"

BRANCH="${1:-main}"
TS="$(date +%Y%m%d-%H%M%S)"
REL="$RELEASES/$TS"

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Setup logging
mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_DIR/deploy.log") 2>&1

log() {
  echo "[$(date -Iseconds)] [deploy] $*"
}

# Deploy lock (prevent parallel builds)
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
  log "ERROR: Deploy already in progress (lock held)"
  exit 1
fi
log "Acquired deploy lock"

# Ensure cleanup on exit
cleanup() {
  flock -u 200 || true
  log "Released deploy lock"
}
trap cleanup EXIT

log "branch=$BRANCH release=$REL"

# Ensure tools
command -v node >/dev/null || { log "ERROR: node not found"; exit 1; }
command -v corepack >/dev/null || { log "ERROR: corepack not found"; exit 1; }
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@9.15.5 --activate >/dev/null

# Repo
if [ ! -d "$REPO_DIR/.git" ]; then
  log "Cloning repository..."
  rm -rf "$REPO_DIR"
  mkdir -p "$REPO_DIR"
  git clone --depth 1 --branch "$BRANCH" https://github.com/richhabits/djdannyhecticb.git "$REPO_DIR"
fi

cd "$REPO_DIR"
log "Fetching latest changes..."
git fetch --all --prune
git reset --hard "origin/$BRANCH"

# Clean install + build (pnpm only; npm will fail by design)
log "Installing dependencies with pnpm..."
pnpm install --frozen-lockfile

log "Building application..."
pnpm build

# Fail-fast: Assert output exists (vite outDir => dist/public)
test -d "dist/public" || { log "ERROR: dist/public missing"; exit 1; }
test -f "dist/public/index.html" || { log "ERROR: dist/public/index.html missing"; exit 1; }
log "Build validation passed"

# Create release dir and copy static output
mkdir -p "$REL/public"
log "Copying build output to release..."
rsync -a --delete "dist/public/" "$REL/public/"

# Create health check file
HEALTH_FILE="$REL/public/health.txt"
echo "OK - Deployed at $(date -Iseconds)" > "$HEALTH_FILE"
log "Created health check: $HEALTH_FILE"

# Atomic switch
log "Switching symlink to new release..."
ln -sfn "$REL" "$APP_ROOT/current"

# Permissions
chown -R hectic:hectic "$REL" "$APP_ROOT/current"
chmod -R a+rX "$REL" "$APP_ROOT/current"

# Reload nginx
log "Validating and reloading nginx..."
nginx -t
systemctl reload nginx

# Auto-prune: Keep last 5 releases
log "Pruning old releases (keeping last 5)..."
ls -1dt "$RELEASES"/* 2>/dev/null | tail -n +6 | xargs -r rm -rf || true
REMAINING=$(ls -1d "$RELEASES"/* 2>/dev/null | wc -l)
log "Releases kept: $REMAINING"

log "OK => $APP_ROOT/current/public"
log "Deployment complete"
