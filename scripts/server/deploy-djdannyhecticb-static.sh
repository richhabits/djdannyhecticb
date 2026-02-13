#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/srv/djdannyhecticb"
REPO_DIR="$APP_ROOT/repo"
RELEASES="$APP_ROOT/releases"

BRANCH="${1:-main}"
TS="$(date +%Y%m%d-%H%M%S)"
REL="$RELEASES/$TS"

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

echo "[deploy] branch=$BRANCH release=$REL"

# Ensure tools
command -v node >/dev/null
command -v corepack >/dev/null || { echo "corepack missing"; exit 1; }
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@9.15.5 --activate >/dev/null

# Repo
if [ ! -d "$REPO_DIR/.git" ]; then
  rm -rf "$REPO_DIR"
  mkdir -p "$REPO_DIR"
  git clone --depth 1 --branch "$BRANCH" https://github.com/richhabits/djdannyhecticb.git "$REPO_DIR"
fi

cd "$REPO_DIR"
git fetch --all --prune
git reset --hard "origin/$BRANCH"

# Clean install + build (pnpm only; npm will fail by design)
pnpm install --frozen-lockfile
pnpm build

# Assert output exists (vite outDir => dist/public)
test -d "dist/public" || { echo "[deploy] ERROR: dist/public missing"; exit 1; }
test -f "dist/public/index.html" || { echo "[deploy] ERROR: dist/public/index.html missing"; exit 1; }

# Create release dir and copy static output
mkdir -p "$REL/public"
rsync -a --delete "dist/public/" "$REL/public/"

# Atomic switch
ln -sfn "$REL" "$APP_ROOT/current"

# Permissions
chown -R hectic:hectic "$REL" "$APP_ROOT/current"
chmod -R a+rX "$REL" "$APP_ROOT/current"

# Reload nginx
nginx -t
systemctl reload nginx

echo "[deploy] OK => $APP_ROOT/current/public"
