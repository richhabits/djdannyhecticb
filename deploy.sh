#!/bin/bash

# DJ Danny Hectic B - Deployment Script
# IP: 213.199.45.126

echo "Starting deployment process..."

# 1. Pull latest changes
# git pull origin main

# 2. Build and start containers
docker-compose up -d --build

# 3. Apply DB migrations (if using real DB)
# docker-compose exec web npm run db:push

echo "Deployment complete! Website should be accessible at http://213.199.45.126"
echo "Note: SSL configuration requires certbot setup."
