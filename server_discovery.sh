#!/bin/bash

# Hectic Empire: Server Audit & Design Discovery Script
# This script inspects the server to locate:
# 1. Current Nginx Configuration (what version is live?)
# 2. Backup artifacts (tarballs, zips, old directories)
# 3. Git history (if applicable)

echo "=== HECTIC EMPIRE: SERVER AUDIT & DISCOVERY ==="
echo "Date: $(date)"
echo "-----------------------------------------------"

echo ""
echo "### 1. NGINX CONFIGURATION SCAN"
echo "Searching for server blocks serving 'djdannyhecticb'..."
if command -v nginx >/dev/null; then
    nginx -T 2>/dev/null | grep -nE "server_name djdannyhecticb|root |alias |proxy_pass" | head -n 50
else
    echo "⚠️ Nginx binary not found in path. Trying docker..."
    if command -v docker-compose >/dev/null; then
       docker-compose logs --tail=100 nginx
    fi
fi

echo ""
echo "### 2. FILE SYSTEM FORENSICS (Searching for Design Artifacts)"
echo "Searching /var/www for likely backup archives..."
find /var/www -maxdepth 4 -type f \( -name "*.tar.gz" -o -name "*.zip" -o -name "*.tgz" -o -name "*.bak" -o -name "*.old" \) -printf "%TY-%Tm-%Td %TH:%TM  %p\n" 2>/dev/null | sort -r | head -n 50

echo ""
echo "Searching /var/www for index.html files (Potential Design Versions)..."
find /var/www -maxdepth 4 -type f -name "index.html" -printf "%TY-%Tm-%Td %TH:%TM  %p\n" 2>/dev/null | sort -r | head -n 50

echo ""
echo "### 3. GIT REPO STATUS"
if [ -d "/var/www/djdannyhecticb/.git" ]; then
    echo "Git repo found at /var/www/djdannyhecticb"
    cd /var/www/djdannyhecticb
    echo "Last 10 commits:"
    git log --oneline -n 10
else
    echo "No .git directory found at standard location."
fi

echo ""
echo "=== AUDIT COMPLETE ==="
