#!/bin/bash

# nginx 403 Automatic Fix Script
# DJ Danny Hectic B

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MODE=${1:-""}

if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ This script needs sudo access${NC}"
    echo "Run with: sudo ./fix-nginx-403.sh [static|proxy]"
    exit 1
fi

if [ "$MODE" != "static" ] && [ "$MODE" != "proxy" ]; then
    echo -e "${RED}❌ Invalid mode${NC}"
    echo ""
    echo "Usage: sudo ./fix-nginx-403.sh [MODE]"
    echo ""
    echo "Modes:"
    echo "  static  - Serve static files from dist/public (Vite SPA)"
    echo "  proxy   - Reverse proxy to PM2 on port 3005 (recommended)"
    echo ""
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  nginx 403 Fix - Mode: $MODE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Determine script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${YELLOW}[1/5] Backing up current nginx configuration...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/djdannyhecticb_nginx_backup_${TIMESTAMP}.conf"

if [ -f "/etc/nginx/sites-available/djdannyhecticb.com" ]; then
    cp /etc/nginx/sites-available/djdannyhecticb.com "$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup saved to: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠ No existing config found${NC}"
fi

echo ""
echo -e "${YELLOW}[2/5] Installing new nginx configuration...${NC}"

CONFIG_SOURCE="$REPO_ROOT/nginx-configs/${MODE}.conf"

if [ ! -f "$CONFIG_SOURCE" ]; then
    echo -e "${RED}✗ Configuration template not found: $CONFIG_SOURCE${NC}"
    exit 1
fi

cp "$CONFIG_SOURCE" /etc/nginx/sites-available/djdannyhecticb.com
echo -e "${GREEN}✓ Configuration installed${NC}"

# Enable site if not already enabled
if [ ! -L "/etc/nginx/sites-enabled/djdannyhecticb.com" ]; then
    ln -s /etc/nginx/sites-available/djdannyhecticb.com /etc/nginx/sites-enabled/djdannyhecticb.com
    echo -e "${GREEN}✓ Site enabled${NC}"
fi

echo ""
echo -e "${YELLOW}[3/5] Testing nginx configuration...${NC}"

if nginx -t 2>&1; then
    echo -e "${GREEN}✓ nginx configuration is valid${NC}"
else
    echo -e "${RED}✗ nginx configuration test failed${NC}"
    echo "Restoring backup..."
    
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" /etc/nginx/sites-available/djdannyhecticb.com
        echo "Run: sudo nginx -t"
    fi
    
    exit 1
fi

echo ""
echo -e "${YELLOW}[4/5] Setting up file permissions...${NC}"

if [ "$MODE" = "static" ]; then
    # Ensure dist/public exists and has correct permissions
    if [ -d "/srv/djdannyhecticb/dist/public" ]; then
        chown -R hectic:hectic /srv/djdannyhecticb
        chmod -R a+rX /srv/djdannyhecticb
        echo -e "${GREEN}✓ Permissions set on /srv/djdannyhecticb${NC}"
        
        if [ -f "/srv/djdannyhecticb/dist/public/index.html" ]; then
            echo -e "${GREEN}✓ index.html found${NC}"
        else
            echo -e "${RED}✗ index.html NOT found in dist/public${NC}"
            echo "You need to build the application first:"
            echo "  pnpm build"
            echo "  ./deploy-pm2.sh"
        fi
    else
        echo -e "${RED}✗ /srv/djdannyhecticb/dist/public not found${NC}"
        echo "Build the application first with: pnpm build"
        exit 1
    fi
elif [ "$MODE" = "proxy" ]; then
    # Check if PM2 is running
    if command -v pm2 &> /dev/null; then
        PM2_RUNNING=$(pm2 jlist 2>/dev/null | grep -c "djdannyhecticb" || echo "0")
        
        if [ "$PM2_RUNNING" = "0" ]; then
            echo -e "${YELLOW}⚠ djdannyhecticb not running in PM2${NC}"
            echo "Start it with:"
            echo "  cd /srv/djdannyhecticb"
            echo "  pm2 start dist/index.mjs --name djdannyhecticb"
            echo "  pm2 save"
        else
            echo -e "${GREEN}✓ PM2 process found${NC}"
            
            # Check if port is listening
            if ss -ltn | grep -q ":3005"; then
                echo -e "${GREEN}✓ Port 3005 is listening${NC}"
            else
                echo -e "${RED}✗ Port 3005 is NOT listening${NC}"
                echo "Check PM2 logs: pm2 logs djdannyhecticb"
            fi
        fi
    else
        echo -e "${RED}✗ PM2 not installed${NC}"
        echo "Install with: sudo npm install -g pm2"
    fi
fi

echo ""
echo -e "${YELLOW}[5/5] Reloading nginx...${NC}"

systemctl reload nginx

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ nginx reloaded successfully${NC}"
else
    echo -e "${RED}✗ nginx failed to reload${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Fix Applied Successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$MODE" = "static" ]; then
    echo "Mode: Static File Serving"
    echo "  Root: /srv/djdannyhecticb/dist/public"
    echo "  Files are served directly by nginx"
elif [ "$MODE" = "proxy" ]; then
    echo "Mode: Reverse Proxy"
    echo "  Backend: http://127.0.0.1:3005"
    echo "  nginx proxies requests to PM2 process"
fi

echo ""
echo "Test the site:"
echo "  curl -I https://djdannyhecticb.com"
echo ""
echo "View nginx logs:"
echo "  sudo tail -f /var/log/nginx/error.log"
echo "  sudo tail -f /var/log/nginx/djdannyhecticb-access.log"
echo ""

if [ "$MODE" = "proxy" ]; then
    echo "Check PM2 status:"
    echo "  pm2 list"
    echo "  pm2 logs djdannyhecticb"
    echo ""
fi

echo "Backup of old config: $BACKUP_FILE"
