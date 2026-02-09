#!/bin/bash
echo "=== FIXING .co.uk SSL CERTIFICATE ==="
echo ""
echo "This script will request a new certificate that explicitly includes ALL domains."
echo ""

# 1. Stop Nginx to free up port 80 for standalone cert request (or use webroot if preferred)
# Since we are likely in a docker container, we use docker-compose commands
echo "Stopping Nginx..."
docker-compose stop nginx

# 2. Run Certbot
# We request a SINGLE certificate that covers ALL domains.
# This ensures djdannyhecticb.co.uk is on the same valid cert as .com
echo "Requesting new certificate..."
docker-compose run --rm certbot certonly --standalone \
  --email contact@djdannyhecticb.com \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d djdannyhecticb.com \
  -d www.djdannyhecticb.com \
  -d djdannyhecticb.co.uk \
  -d www.djdannyhecticb.co.uk \
  -d djdannyhecticb.info \
  -d www.djdannyhecticb.info \
  -d djdannyhecticb.uk \
  -d www.djdannyhecticb.uk

# 3. Check if successful
if [ $? -eq 0 ]; then
    echo "✅ Certificate generation successful!"
    echo "Starting Nginx..."
    docker-compose up -d nginx
    echo "✅ Nginx restarted."
    echo ""
    echo "IMPORTANT: Verification"
    echo "Please visit https://djdannyhecticb.co.uk to confirm the lock icon appears."
else
    echo "❌ Certificate generation FAILED."
    echo "Check the error message above."
    echo "Restarting nginx just in case..."
    docker-compose up -d nginx
fi
