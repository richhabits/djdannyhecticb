#!/bin/bash

# DJ Danny Hectic B - SSL Setup Script
# This script generates SSL certificates and switches nginx to HTTPS mode

set -e

echo "=========================================="
echo "DJ Danny Hectic B - SSL Certificate Setup"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Please run as root (use sudo)"
    exit 1
fi

# Define domains
DOMAINS="djdannyhecticb.co.uk www.djdannyhecticb.co.uk djdannyhecticb.com www.djdannyhecticb.com djdannyhecticb.info www.djdannyhecticb.info djdannyhecticb.uk www.djdannyhecticb.uk"
PRIMARY_DOMAIN="djdannyhecticb.co.uk"

# Get email from environment variable, command line argument, or prompt
if [ -n "$1" ]; then
    EMAIL="$1"
elif [ -n "$SSL_EMAIL" ]; then
    EMAIL="$SSL_EMAIL"
else
    echo "📧 Please enter your email address for Let's Encrypt notifications:"
    read -r EMAIL
fi

if [ -z "$EMAIL" ]; then
    echo "❌ Email is required for SSL certificate generation"
    echo "   Usage: $0 <email>"
    echo "   Or set SSL_EMAIL environment variable"
    exit 1
fi

echo ""
echo "🔐 Generating SSL certificates for:"
echo "$DOMAINS"
echo ""
echo "Using email: $EMAIL"
echo ""

# Create certbot directories if they don't exist
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Generate certificates using certbot
echo "🚀 Starting certificate generation..."
docker-compose run --rm certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d djdannyhecticb.co.uk \
    -d www.djdannyhecticb.co.uk \
    -d djdannyhecticb.com \
    -d www.djdannyhecticb.com \
    -d djdannyhecticb.info \
    -d www.djdannyhecticb.info \
    -d djdannyhecticb.uk \
    -d www.djdannyhecticb.uk

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL certificates generated successfully!"
    echo ""
    echo "📝 Now switching nginx to HTTPS configuration..."
    
    # Update docker-compose to use HTTPS nginx config
    sed -i.bak 's/nginx-http.conf/nginx.conf/g' docker-compose.yml
    
    echo "🔄 Restarting nginx with HTTPS configuration..."
    docker-compose up -d --force-recreate nginx
    
    echo ""
    echo "=========================================="
    echo "✅ SSL Setup Complete!"
    echo "=========================================="
    echo ""
    echo "Your site should now be accessible at:"
    echo "  🌐 https://djdannyhecticb.co.uk (Primary)"
    echo "  🌐 https://www.djdannyhecticb.co.uk"
    echo "  🌐 https://djdannyhecticb.com"
    echo "  🌐 https://djdannyhecticb.info"
    echo "  🌐 https://djdannyhecticb.uk"
    echo ""
    echo "HTTP traffic will automatically redirect to HTTPS"
    echo ""
    echo "📅 Certificates will auto-renew every 12 hours via the certbot container"
    echo ""
else
    echo ""
    echo "❌ Certificate generation failed!"
    echo ""
    echo "Common issues:"
    echo "  1. DNS records not pointing to this server (213.199.45.126)"
    echo "  2. Port 80 not accessible from the internet"
    echo "  3. Firewall blocking HTTP traffic"
    echo ""
    echo "Please verify your DNS settings and try again."
    exit 1
fi
