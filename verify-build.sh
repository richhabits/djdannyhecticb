#!/bin/bash

# Build Verification Script
# Verifies that the build process completed successfully

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔍 Build Verification${NC}"
echo "===================="
echo ""

ERRORS=0

# Check dist directory exists
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ dist/ directory not found${NC}"
    echo "   Run: pnpm build"
    exit 1
else
    echo -e "${GREEN}✓ dist/ directory exists${NC}"
fi

# Check backend bundle
if [ ! -f "dist/index.mjs" ]; then
    echo -e "${RED}❌ dist/index.mjs not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Backend bundle: dist/index.mjs${NC}"
    SIZE=$(du -sh dist/index.mjs | cut -f1)
    echo "   Size: $SIZE"
fi

# Check frontend directory
if [ ! -d "dist/public" ]; then
    echo -e "${RED}❌ dist/public/ directory not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Frontend directory: dist/public/${NC}"
    SIZE=$(du -sh dist/public | cut -f1)
    FILE_COUNT=$(find dist/public -type f | wc -l)
    echo "   Size: $SIZE"
    echo "   Files: $FILE_COUNT"
fi

# Check for index.html
if [ ! -f "dist/public/index.html" ]; then
    echo -e "${RED}❌ dist/public/index.html not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Frontend entry: dist/public/index.html${NC}"
fi

# Check for assets directory
if [ -d "dist/public/assets" ]; then
    echo -e "${GREEN}✓ Assets directory: dist/public/assets/${NC}"
    ASSET_COUNT=$(find dist/public/assets -type f | wc -l)
    echo "   Assets: $ASSET_COUNT files"
else
    echo -e "${YELLOW}⚠ No assets directory found${NC}"
fi

echo ""
echo "===================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Build verification passed!${NC}"
    echo ""
    echo "Ready to deploy:"
    echo "  ./deploy-pm2.sh"
    exit 0
else
    echo -e "${RED}❌ Build verification failed with $ERRORS errors${NC}"
    echo ""
    echo "Fix the build first:"
    echo "  pnpm build"
    exit 1
fi
