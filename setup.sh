#!/bin/bash

# DJ Danny Hectic B - Complete Setup Script
# This script sets up the entire application from scratch

set -e  # Exit on error

echo "🎧 DJ Danny Hectic B - Complete Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run this script as root${NC}"
   exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Check Prerequisites
echo "📋 Checking prerequisites..."
echo ""

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION${NC}"
fi

if ! command_exists pnpm; then
    echo -e "${YELLOW}⚠ pnpm not found, installing...${NC}"
    npm install -g pnpm
    echo -e "${GREEN}✓ pnpm installed${NC}"
else
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓ pnpm $PNPM_VERSION${NC}"
fi

if ! command_exists mysql; then
    echo -e "${YELLOW}⚠ MySQL not detected. You'll need a database.${NC}"
    echo "You can use:"
    echo "  - Local MySQL: sudo apt install mysql-server"
    echo "  - Cloud: PlanetScale, Railway, AWS RDS"
else
    echo -e "${GREEN}✓ MySQL detected${NC}"
fi

echo ""

# 2. Install Dependencies
echo "📦 Installing dependencies..."
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# 3. Environment Setup
echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo ""
    echo -e "${YELLOW}⚠ IMPORTANT: Edit .env with your actual credentials${NC}"
    echo ""
    echo "Required variables:"
    echo "  - DATABASE_URL (your MySQL connection string)"
    echo "  - OAUTH_SERVER_URL (OAuth server URL)"
    echo "  - APP_ID (application ID)"
    echo "  - JWT_SECRET (random secret key)"
    echo ""
    echo "Optional but recommended:"
    echo "  - STRIPE_SECRET_KEY (for payments)"
    echo "  - RESEND_API_KEY (for emails)"
    echo "  - OPENAI_API_KEY (for AI features)"
    echo "  - AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY (for file uploads)"
    echo ""
    read -p "Press Enter after editing .env to continue..."
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi
echo ""

# 4. Database Setup
echo "💾 Setting up database..."
echo ""
echo "Make sure your DATABASE_URL is set in .env"
read -p "Ready to run migrations? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pnpm db:push
    echo -e "${GREEN}✓ Database migrations completed${NC}"
    echo ""
    
    read -p "Seed database with initial data? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pnpm db:seed
        echo -e "${GREEN}✓ Database seeded${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Skipped database setup${NC}"
fi
echo ""

# 5. Build Check
echo "🔨 Building application..."
pnpm build
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# 6. Final Checks
echo "✅ Setup Complete!"
echo ""
echo "═══════════════════════════════════════"
echo ""
echo "🚀 To start development:"
echo "   pnpm dev"
echo ""
echo "🚀 To start production:"
echo "   pnpm start"
echo ""
echo "📝 Next steps:"
echo "   1. Verify .env contains all necessary credentials"
echo "   2. Test database connection"
echo "   3. Configure payment gateway (Stripe)"
echo "   4. Set up email service (Resend)"
echo "   5. Add AI provider keys (OpenAI, ElevenLabs)"
echo "   6. Configure S3 for file uploads"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Getting started guide"
echo "   - DEPLOYMENT.md - Production deployment"
echo "   - docs/ - Architecture and playbooks"
echo ""
echo "═══════════════════════════════════════"
echo ""
echo "🎧 Ready to spin some tracks! 🔥"
