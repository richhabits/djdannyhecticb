#!/bin/bash

# DJ Danny Hectic B - Admin Setup Script
# Creates the first admin user with password authentication

set -e

echo "=========================================="
echo "DJ Danny Hectic B - Admin Setup"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Please run as root (use sudo)"
    exit 1
fi

echo "📧 Enter admin email address:"
read -r EMAIL

if [ -z "$EMAIL" ]; then
    echo "❌ Email is required"
    exit 1
fi

echo "🔐 Enter admin password (min 8 characters):"
read -s PASSWORD

if [ -z "$PASSWORD" ] || [ ${#PASSWORD} -lt 8 ]; then
    echo "❌ Password must be at least 8 characters"
    exit 1
fi

echo ""
echo "👤 Enter admin name (optional, press Enter to skip):"
read -r NAME

echo ""
echo "🚀 Creating admin user..."

# Call the setup endpoint
RESPONSE=$(curl -s -X POST http://localhost:3000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"${NAME:-Admin}\"}")

if echo "$RESPONSE" | grep -q "success"; then
    echo ""
    echo "✅ Admin user created successfully!"
    echo ""
    echo "You can now login at:"
    echo "  🔐 https://djdannyhecticb.co.uk/login"
    echo ""
    echo "Admin email: $EMAIL"
    echo ""
else
    echo ""
    echo "❌ Failed to create admin user"
    echo "Response: $RESPONSE"
    echo ""
    echo "Make sure the web container is running:"
    echo "  docker-compose ps web"
    exit 1
fi

