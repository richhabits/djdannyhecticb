#!/bin/bash

# Safe SSL Fix Script
# Strategy: Surgical Cert Repair (Single Domain First)
# Author: Hectic Empire DevOps

set -e

DOMAIN="djdannyhecticb.co.uk"
SERVER_IP="213.199.45.126"

echo "=== HECTIC EMPIRE: SURGICAL SSL REPAIR ==="
echo "Target: $DOMAIN on $SERVER_IP"
echo "------------------------------------------"

# 1. Pre-Flight Checks
echo "[1/5] Checking user privileges..."
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root (sudo)."
  exit 1
fi

echo "[2/5] Verifying DNS resolution on this machine..."
if command -v dig >/dev/null; then
  RESOLVED_IP=$(dig +short $DOMAIN | tail -n1)
elif command -v host >/dev/null; then
  RESOLVED_IP=$(host $DOMAIN | awk '/has address/ { print $4 }')
else
  # Fallback to ping
  RESOLVED_IP=$(ping -c 1 $DOMAIN | awk -F'[()]' '/PING/{print $2}')
fi

echo "    Domain resolves to: $RESOLVED_IP"

# Warn if it doesn't match the expected server IP (but don't hard fail, maybe internal routing)
if [[ "$RESOLVED_IP" != "$SERVER_IP" ]]; then
    echo "⚠️  WARNING: DNS IP ($RESOLVED_IP) does not match expected Server IP ($SERVER_IP)."
    echo "    This might cause validation failure unless this is an internal NAT IP."
    read -p "    Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborting."
        exit 1
    fi
fi

# 2. Backup
echo "[3/5] Backing up Nginx configuration..."
TIMESTAMP=$(date +%F-%H%M%S)
if [ -d /etc/nginx ]; then
    cp -a /etc/nginx /etc/nginx.bak.$TIMESTAMP
    echo "    Backup created at /etc/nginx.bak.$TIMESTAMP"
else
    echo "    /etc/nginx not found on host, assuming Docker-only mount. Skipping host backup."
fi

# 3. Surgical Cert Issue (Webroot Mode)
echo "[4/5] Attempting Safe Webroot Issuance for $DOMAIN..."
echo "    Using docker-compose from current directory..."

# Detect compose command
if command -v docker-compose >/dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

# Run Certbot for just the .co.uk domain
# Using webroot mode avoids stopping nginx
# Using standalone mode (requires stopping nginx)
$COMPOSE_CMD stop nginx
$COMPOSE_CMD run --rm certbot certonly --standalone \
  --email contact@djdannyhecticb.com \
  --agree-tos --no-eff-email --force-renewal \
  -d djdannyhecticb.co.uk -d www.djdannyhecticb.co.uk

# Restart nginx immediately
$COMPOSE_CMD start nginx

if [ $? -eq 0 ]; then
    echo "✅ Certificate issued successfully!"
else
    echo "❌ Certbot failed. Check the logs above."
    echo "    Common causes: DNS mismatch, firewall blocking port 80/.well-known."
    exit 1
fi

# 4. Restart Nginx
echo "[5/5] Restarting Nginx to load new certs..."
$COMPOSE_CMD restart nginx

# 5. Verification
echo "------------------------------------------"
echo "✅ REPAIR COMPLETE."
echo "Please verify by visiting: https://djdannyhecticb.co.uk"
