#!/bin/bash

# DJ Danny Hectic B - Deployment Script
# Server IP: 213.199.45.126

set -e

echo "=========================================="
echo "DJ Danny Hectic B - Deployment"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and set your production values!"
    echo ""
fi

echo "🔨 Building and starting containers..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "🔍 Checking container status..."
docker-compose ps

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Your site should be accessible at:"
echo "  🌐 http://djdannyhecticb.co.uk (Primary)"
echo "  🌐 http://www.djdannyhecticb.co.uk"
echo "  🌐 http://djdannyhecticb.com"
echo "  🌐 http://213.199.45.126"
echo ""
echo "📋 Next Steps:"
echo "  1. Verify the site is working via HTTP"
echo "  2. Run './setup-ssl.sh' to enable HTTPS"
echo ""
echo "🔧 Useful Commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Restart: docker-compose restart"
echo "  - Stop: docker-compose down"
echo ""
