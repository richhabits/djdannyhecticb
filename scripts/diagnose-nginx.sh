#!/bin/bash

# nginx 403 Diagnostic Script for DJ Danny Hectic B
# This script helps diagnose why nginx is returning 403 Forbidden

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  nginx 403 Diagnostic Tool${NC}"
echo -e "${BLUE}  DJ Danny Hectic B${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ This script needs sudo access${NC}"
    echo "Run with: sudo ./diagnose-nginx.sh"
    exit 1
fi

echo -e "${YELLOW}[1/6] Checking nginx service status...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ nginx is running${NC}"
else
    echo -e "${RED}✗ nginx is NOT running${NC}"
    echo "Start it with: sudo systemctl start nginx"
    exit 1
fi

echo ""
echo -e "${YELLOW}[2/6] Finding djdannyhecticb.com server block...${NC}"
NGINX_CONFIG=$(nginx -T 2>/dev/null | sed -n '/server_name.*djdannyhecticb.com/,/^}/p' | head -100)

if [ -z "$NGINX_CONFIG" ]; then
    echo -e "${RED}✗ No server block found for djdannyhecticb.com${NC}"
    echo "Check /etc/nginx/sites-available/"
    exit 1
else
    echo -e "${GREEN}✓ Found server block${NC}"
    echo "$NGINX_CONFIG"
fi

echo ""
echo -e "${YELLOW}[3/6] Extracting configuration details...${NC}"

# Extract root directory
ROOT_DIR=$(echo "$NGINX_CONFIG" | grep -m1 "root " | awk '{print $2}' | tr -d ';')
if [ -n "$ROOT_DIR" ]; then
    echo -e "Root directory: ${BLUE}$ROOT_DIR${NC}"
else
    echo -e "${YELLOW}⚠ No 'root' directive found (might be using proxy)${NC}"
fi

# Check for proxy_pass
PROXY_PASS=$(echo "$NGINX_CONFIG" | grep "proxy_pass" | head -1)
if [ -n "$PROXY_PASS" ]; then
    echo -e "Proxy configuration: ${BLUE}$PROXY_PASS${NC}"
else
    echo "No proxy_pass found (static file mode)"
fi

# Extract index
INDEX_FILE=$(echo "$NGINX_CONFIG" | grep "index " | awk '{print $2}' | tr -d ';')
if [ -n "$INDEX_FILE" ]; then
    echo -e "Index file: ${BLUE}$INDEX_FILE${NC}"
fi

echo ""
echo -e "${YELLOW}[4/6] Checking file system...${NC}"

# Check /srv/djdannyhecticb
if [ -d "/srv/djdannyhecticb" ]; then
    echo -e "${GREEN}✓ /srv/djdannyhecticb exists${NC}"
    ls -la /srv/djdannyhecticb 2>&1 | head -10
else
    echo -e "${RED}✗ /srv/djdannyhecticb does NOT exist${NC}"
fi

echo ""

# Check dist/public if it exists
if [ -d "/srv/djdannyhecticb/dist/public" ]; then
    echo -e "${GREEN}✓ /srv/djdannyhecticb/dist/public exists${NC}"
    ls -la /srv/djdannyhecticb/dist/public 2>&1 | head -10
    
    if [ -f "/srv/djdannyhecticb/dist/public/index.html" ]; then
        echo -e "${GREEN}✓ index.html found${NC}"
    else
        echo -e "${RED}✗ index.html NOT found in dist/public${NC}"
    fi
else
    echo -e "${YELLOW}⚠ /srv/djdannyhecticb/dist/public does NOT exist${NC}"
fi

echo ""

# Check if root directory exists and has content
if [ -n "$ROOT_DIR" ] && [ -d "$ROOT_DIR" ]; then
    echo -e "Checking configured root: ${BLUE}$ROOT_DIR${NC}"
    ls -la "$ROOT_DIR" 2>&1 | head -10
    
    if [ -f "$ROOT_DIR/index.html" ]; then
        echo -e "${GREEN}✓ index.html found in root${NC}"
    else
        echo -e "${RED}✗ index.html NOT found in root${NC}"
        echo -e "${YELLOW}This is likely causing the 403 error${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}[5/6] Checking PM2 status...${NC}"

if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 jlist 2>/dev/null || echo "[]")
    
    if echo "$PM2_STATUS" | grep -q "djdannyhecticb"; then
        echo -e "${GREEN}✓ djdannyhecticb is running in PM2${NC}"
        pm2 list | grep -A5 "djdannyhecticb" || true
        
        # Check if port 3005 is listening
        if ss -ltn | grep -q ":3005"; then
            echo -e "${GREEN}✓ Port 3005 is listening${NC}"
        else
            echo -e "${RED}✗ Port 3005 is NOT listening${NC}"
        fi
    else
        echo -e "${RED}✗ djdannyhecticb is NOT running in PM2${NC}"
        echo "Available PM2 processes:"
        pm2 list
    fi
else
    echo -e "${YELLOW}⚠ PM2 is not installed${NC}"
fi

echo ""
echo -e "${YELLOW}[6/6] Checking nginx error logs...${NC}"
echo "Last 20 lines of nginx error log:"
tail -n 20 /var/log/nginx/error.log 2>/dev/null || echo "No error log found or permission denied"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Diagnosis Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Provide recommendations
if [ -n "$PROXY_PASS" ]; then
    echo -e "${GREEN}Configuration Mode: Reverse Proxy${NC}"
    
    if echo "$PM2_STATUS" | grep -q "djdannyhecticb"; then
        echo -e "${GREEN}✓ PM2 is running - configuration looks correct${NC}"
        
        if ! ss -ltn | grep -q ":3005"; then
            echo -e "${RED}✗ BUT port 3005 is not listening${NC}"
            echo "Action: Check PM2 logs with: pm2 logs djdannyhecticb"
        fi
    else
        echo -e "${RED}✗ PM2 is NOT running${NC}"
        echo "Action: Start PM2 with:"
        echo "  cd /srv/djdannyhecticb"
        echo "  pm2 start dist/index.mjs --name djdannyhecticb"
    fi
else
    echo -e "${YELLOW}Configuration Mode: Static File Serving${NC}"
    
    if [ -n "$ROOT_DIR" ]; then
        if [ -f "$ROOT_DIR/index.html" ]; then
            echo -e "${GREEN}✓ Root directory has index.html${NC}"
            echo "Check permissions with:"
            echo "  sudo chmod -R a+rX $ROOT_DIR"
        else
            echo -e "${RED}✗ Missing index.html in $ROOT_DIR${NC}"
            echo ""
            echo "Choose one option:"
            echo ""
            echo "Option A: Serve static files from dist/public"
            echo "  Update nginx root to: /srv/djdannyhecticb/dist/public"
            echo "  Run: sudo ./scripts/fix-nginx-403.sh static"
            echo ""
            echo "Option B: Use reverse proxy to PM2 (recommended)"
            echo "  Configure nginx to proxy to port 3005"
            echo "  Run: sudo ./scripts/fix-nginx-403.sh proxy"
        fi
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "For automatic fix, run:"
echo "  sudo ./scripts/fix-nginx-403.sh [static|proxy]"
echo ""
echo "For detailed troubleshooting, see:"
echo "  TROUBLESHOOTING_403.md"
