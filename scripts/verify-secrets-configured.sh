#!/bin/bash
###############################################################################
# Secrets Configuration Verification Script
# Verifies that all required secrets are configured in each environment
# Usage: ./scripts/verify-secrets-configured.sh [environment]
#        where environment is: local, staging, production, all
###############################################################################

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENVIRONMENT="${1:-all}"

# Critical secrets that MUST be configured
CRITICAL_SECRETS=(
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "DATABASE_URL"
  "JWT_SECRET"
)

# High priority secrets (should be configured)
HIGH_PRIORITY_SECRETS=(
  "GOOGLE_AI_API_KEY"
  "YOUTUBE_DATA_API_KEY"
  "TWITCH_CLIENT_ID"
  "TWITCH_CLIENT_SECRET"
  "TICKETMASTER_API_KEY"
)

# Optional secrets (nice to have)
OPTIONAL_SECRETS=(
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "GROQ_API_KEY"
  "COHERE_API_KEY"
  "HUGGINGFACE_API_KEY"
)

MISSING_CRITICAL=0
MISSING_HIGH=0

###############################################################################
# Function: Check Local .env
###############################################################################
check_local_env() {
  echo ""
  echo -e "${BLUE}=== Checking Local Development (.env) ===${NC}"

  if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "   Create it with: cp .env.example .env"
    return 1
  fi

  echo -e "${GREEN}✅ .env file exists${NC}"
  echo ""

  # Check critical secrets
  echo -e "${YELLOW}Critical Secrets:${NC}"
  for secret in "${CRITICAL_SECRETS[@]}"; do
    if grep -q "^${secret}=" .env 2>/dev/null; then
      VALUE=$(grep "^${secret}=" .env | cut -d'=' -f2-)
      if [ -z "$VALUE" ] || [ "$VALUE" = "YOUR_VALUE_HERE" ]; then
        echo -e "${RED}❌ $secret = (empty/placeholder)${NC}"
        MISSING_CRITICAL=$((MISSING_CRITICAL + 1))
      else
        echo -e "${GREEN}✅ $secret = (configured)${NC}"
      fi
    else
      echo -e "${RED}❌ $secret = (missing)${NC}"
      MISSING_CRITICAL=$((MISSING_CRITICAL + 1))
    fi
  done

  echo ""
  echo -e "${YELLOW}High Priority Secrets:${NC}"
  for secret in "${HIGH_PRIORITY_SECRETS[@]}"; do
    if grep -q "^${secret}=" .env 2>/dev/null; then
      VALUE=$(grep "^${secret}=" .env | cut -d'=' -f2-)
      if [ -z "$VALUE" ] || [ "$VALUE" = "YOUR_VALUE_HERE" ]; then
        echo -e "${YELLOW}⚠️  $secret = (empty/placeholder)${NC}"
        MISSING_HIGH=$((MISSING_HIGH + 1))
      else
        echo -e "${GREEN}✅ $secret = (configured)${NC}"
      fi
    else
      echo -e "${YELLOW}⚠️  $secret = (missing)${NC}"
      MISSING_HIGH=$((MISSING_HIGH + 1))
    fi
  done
}

###############################################################################
# Function: Check Vercel Environment
###############################################################################
check_vercel_env() {
  local ENV_NAME="$1"

  echo ""
  echo -e "${BLUE}=== Checking Vercel (${ENV_NAME}) ===${NC}"

  # Check if Vercel CLI is installed
  if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not installed${NC}"
    echo "   Install with: npm install -g vercel"
    return 1
  fi

  # Check if linked to project
  if [ ! -f .vercel/project.json ]; then
    echo -e "${RED}❌ Not linked to Vercel project${NC}"
    echo "   Link with: vercel link"
    return 1
  fi

  echo -e "${GREEN}✅ Linked to Vercel project${NC}"
  echo ""

  # Get environment variables (requires being logged in)
  if ! vercel env list --environments "$ENV_NAME" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Could not check Vercel env vars (may need to login)${NC}"
    echo "   Try: vercel login"
    return 0
  fi

  # Check critical secrets
  echo -e "${YELLOW}Critical Secrets:${NC}"
  for secret in "${CRITICAL_SECRETS[@]}"; do
    if vercel env list --environments "$ENV_NAME" 2>/dev/null | grep -q "^$secret\b"; then
      echo -e "${GREEN}✅ $secret${NC}"
    else
      echo -e "${RED}❌ $secret (missing)${NC}"
      MISSING_CRITICAL=$((MISSING_CRITICAL + 1))
    fi
  done

  echo ""
  echo -e "${YELLOW}High Priority Secrets:${NC}"
  for secret in "${HIGH_PRIORITY_SECRETS[@]}"; do
    if vercel env list --environments "$ENV_NAME" 2>/dev/null | grep -q "^$secret\b"; then
      echo -e "${GREEN}✅ $secret${NC}"
    else
      echo -e "${YELLOW}⚠️  $secret (missing)${NC}"
      MISSING_HIGH=$((MISSING_HIGH + 1))
    fi
  done
}

###############################################################################
# Function: Generate missing secrets report
###############################################################################
generate_report() {
  echo ""
  echo -e "${BLUE}=== Summary ===${NC}"

  if [ $MISSING_CRITICAL -eq 0 ]; then
    echo -e "${GREEN}✅ All critical secrets configured${NC}"
  else
    echo -e "${RED}❌ Missing $MISSING_CRITICAL critical secret(s)${NC}"
  fi

  if [ $MISSING_HIGH -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing $MISSING_HIGH high-priority secret(s)${NC}"
  fi

  echo ""
  echo -e "${BLUE}Getting Started:${NC}"
  echo "1. Copy template: cp .env.example .env"
  echo "2. Fill in secrets: vi .env"
  echo "3. Verify: ./scripts/verify-secrets-configured.sh local"
  echo "4. For Vercel: vercel env add SECRET_NAME"
  echo ""
}

###############################################################################
# Main Script
###############################################################################

case "$ENVIRONMENT" in
  local)
    check_local_env
    ;;
  staging)
    check_vercel_env "preview"
    ;;
  production)
    check_vercel_env "production"
    ;;
  all)
    check_local_env
    check_vercel_env "preview"
    check_vercel_env "production"
    ;;
  *)
    echo "Usage: $0 [environment]"
    echo "  environment: local, staging, production, all (default: all)"
    exit 1
    ;;
esac

generate_report

if [ $MISSING_CRITICAL -gt 0 ]; then
  exit 1
else
  exit 0
fi
