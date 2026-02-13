#!/bin/bash

# DJ Danny Hectic B - PM2 Deployment Script
# This script builds the application locally and deploys it to the production server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REMOTE_USER="${DEPLOY_USER:-hectic}"
REMOTE_HOST="${DEPLOY_HOST:-213.199.45.126}"
REMOTE_DIR="${DEPLOY_DIR:-/srv/djdannyhecticb}"
APP_NAME="djdannyhecticb"

echo -e "${GREEN}🚀 DJ Danny Hectic B - PM2 Deployment${NC}"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ Error: pnpm is not installed${NC}"
    echo "Install it with: npm install -g pnpm"
    exit 1
fi

# Step 1: Clean previous build
echo ""
echo -e "${YELLOW}📦 Step 1: Cleaning previous build...${NC}"
rm -rf dist/

# Step 2: Install dependencies (if needed)
echo ""
echo -e "${YELLOW}📦 Step 2: Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
else
    echo "Dependencies already installed"
fi

# Step 3: Build application
echo ""
echo -e "${YELLOW}🔨 Step 3: Building application...${NC}"
pnpm build

# Step 4: Verify build output
echo ""
echo -e "${YELLOW}✅ Step 4: Verifying build output...${NC}"
if [ ! -f "dist/index.mjs" ]; then
    echo -e "${RED}❌ Error: dist/index.mjs not found${NC}"
    echo "Build failed - backend bundle missing"
    exit 1
fi

if [ ! -d "dist/public" ]; then
    echo -e "${RED}❌ Error: dist/public/ not found${NC}"
    echo "Build failed - frontend files missing"
    exit 1
fi

echo -e "${GREEN}✓ Backend bundle: dist/index.mjs${NC}"
echo -e "${GREEN}✓ Frontend files: dist/public/${NC}"

# Get build size
BACKEND_SIZE=$(du -sh dist/index.mjs | cut -f1)
FRONTEND_SIZE=$(du -sh dist/public | cut -f1)
echo "  Backend size: $BACKEND_SIZE"
echo "  Frontend size: $FRONTEND_SIZE"

# Step 5: Deploy to server
echo ""
echo -e "${YELLOW}📤 Step 5: Deploying to server...${NC}"
echo "Target: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}"

# Check if server is reachable
if ! ssh -o ConnectTimeout=5 ${REMOTE_USER}@${REMOTE_HOST} "echo 'Server reachable'" &> /dev/null; then
    echo -e "${RED}❌ Error: Cannot connect to server${NC}"
    echo "Check your SSH connection to ${REMOTE_USER}@${REMOTE_HOST}"
    exit 1
fi

# Create remote directory if it doesn't exist
echo "Creating remote directory structure..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_DIR}"

# Deploy backend
echo "Uploading backend bundle..."
rsync -avz --progress dist/index.mjs ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

# Deploy frontend
echo "Uploading frontend files..."
rsync -avz --delete --progress dist/public/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/public/

# Deploy package.json (for PM2 metadata)
echo "Uploading package.json..."
rsync -avz package.json ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

# Step 6: Restart application on server
echo ""
echo -e "${YELLOW}🔄 Step 6: Restarting application...${NC}"

# Check if PM2 is installed on server
if ! ssh ${REMOTE_USER}@${REMOTE_HOST} "command -v pm2" &> /dev/null; then
    echo -e "${RED}❌ Error: PM2 is not installed on server${NC}"
    echo "Install it with: ssh ${REMOTE_USER}@${REMOTE_HOST} 'sudo npm install -g pm2'"
    exit 1
fi

# Restart or start the application
ssh ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
cd /srv/djdannyhecticb

# Check if app is already running
if pm2 list | grep -q "djdannyhecticb"; then
    echo "Restarting existing application..."
    pm2 restart djdannyhecticb
else
    echo "Starting new application..."
    pm2 start dist/index.mjs --name djdannyhecticb
    pm2 save
fi

# Show status
pm2 list
ENDSSH

# Step 7: Verify deployment
echo ""
echo -e "${YELLOW}✅ Step 7: Verifying deployment...${NC}"

# Wait a moment for app to start
sleep 3

# Check if app is running via PM2
APP_STATUS=$(ssh ${REMOTE_USER}@${REMOTE_HOST} "pm2 jlist" | grep -o '"name":"djdannyhecticb","pm_id":[0-9]*,"status":"[^"]*"' | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$APP_STATUS" = "online" ]; then
    echo -e "${GREEN}✓ Application is running on PM2${NC}"
else
    echo -e "${RED}⚠ Application status: $APP_STATUS${NC}"
    echo "Check logs with: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 logs djdannyhecticb'"
fi

# Try to curl the application
echo "Testing application endpoint..."
if ssh ${REMOTE_USER}@${REMOTE_HOST} "curl -sf http://127.0.0.1:3005 > /dev/null"; then
    echo -e "${GREEN}✓ Application is responding${NC}"
else
    echo -e "${YELLOW}⚠ Application may not be responding on port 3005${NC}"
    echo "Check logs with: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 logs djdannyhecticb'"
fi

# Step 8: Summary
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo "Application Details:"
echo "  Name: $APP_NAME"
echo "  Server: ${REMOTE_HOST}"
echo "  Path: ${REMOTE_DIR}"
echo "  Status: $APP_STATUS"
echo ""
echo "Next Steps:"
echo "  • Visit: https://djdannyhecticb.com"
echo "  • View logs: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 logs ${APP_NAME}'"
echo "  • Check status: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 status'"
echo ""
echo -e "${GREEN}🎉 Happy deploying!${NC}"
