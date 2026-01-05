#!/bin/bash

# Configuration
URL="https://djdannyhecticb.com/api/health"
CONTAINER="djdannyhecticb-web-1"
LOG_FILE="/var/www/djdannyhecticb/auto-fix.log"
MAX_RETRIES=3

# Timestamp
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check Health
# We use curl -f which returns fail code on 400/500 errors
# We also grep for "ok" to ensure it's not just returning HTML fallback
STATUS=$(curl -s -f "$URL" | grep -i "ok")

if [ -z "$STATUS" ]; then
    echo "[$DATE] Health check failed for $URL" >> "$LOG_FILE"
    
    # Retry logic or restart? 
    # Let's simple restart for now, but check if we didn't just restart recently?
    # For now, just restart via docker compose to strict restart
    
    echo "[$DATE] Restarting $CONTAINER..." >> "$LOG_FILE"
    cd /var/www/djdannyhecticb && docker compose restart web
    
    # Wait for restart
    sleep 30
    
    # Verify again
    STATUS_AFTER=$(curl -s -f "$URL" | grep -i "ok")
    if [ -n "$STATUS_AFTER" ]; then
         echo "[$DATE] Recovery successful." >> "$LOG_FILE"
    else
         echo "[$DATE] Recovery FAILED." >> "$LOG_FILE"
    fi
else
    # Healthy - optional logging or silence
    # echo "[$DATE] System healthy." >> "$LOG_FILE"
    :
fi
