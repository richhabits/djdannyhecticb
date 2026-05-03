#!/bin/bash
###############################################################################
# Secrets Verification Script
# Prevents hardcoded secrets from being committed to version control
# Usage: ./scripts/verify-no-secrets.sh
###############################################################################

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FOUND=0
WARNINGS=0

echo -e "${YELLOW}=== Scanning for Hardcoded Secrets ===${NC}"
echo ""

# Array of secret patterns to look for
declare -a PATTERNS=(
  "GOCSPX-"           # Google OAuth Secret format
  "sk_live_"          # Stripe live key
  "sk_test_"          # Stripe test key
  "BEGIN PRIVATE KEY" # Private RSA/EC keys
  "BEGIN RSA PRIVATE" # RSA private key
  "AIzaSy"            # Google API key prefix (be specific to exclude legitimate usage)
  "Blackgrapeman"     # Database password (example)
  "6j2q6m"            # Twitch Client ID pattern
)

# Check source files for hardcoded secrets
echo -e "${YELLOW}Checking source code for hardcoded secrets...${NC}"
for pattern in "${PATTERNS[@]}"; do
  # Search in source files, excluding common directories
  if grep -r "$pattern" \
      --include="*.ts" \
      --include="*.js" \
      --include="*.tsx" \
      --include="*.jsx" \
      --include="*.json" \
      --exclude-dir=node_modules \
      --exclude-dir=.git \
      --exclude-dir=dist \
      --exclude-dir=build \
      --exclude-dir=.vercel \
      --exclude="*.example" \
      --exclude="SECURITY_AUDIT.md" \
      --exclude="SECRETS_MANAGEMENT.md" \
      . 2>/dev/null || true | \
      grep -v "^./docs/\|^./scripts/\|\.env" ; then
    echo -e "${RED}❌ FOUND PATTERN: '$pattern'${NC}"
    FOUND=1
  fi
done

echo ""

# Check if .env is tracked in git
echo -e "${YELLOW}Checking if .env files are in version control...${NC}"
if git ls-files 2>/dev/null | grep -E "\.env($|\.)" >/dev/null 2>&1; then
  echo -e "${RED}❌ .env file(s) tracked in git:${NC}"
  git ls-files | grep -E "\.env($|\.)"
  FOUND=1
fi

# Check if .gitignore is properly configured
echo ""
echo -e "${YELLOW}Checking .gitignore configuration...${NC}"
if [ -f .gitignore ]; then
  if grep -q "^\.env" .gitignore; then
    echo -e "${GREEN}✅ .env properly ignored in .gitignore${NC}"
  else
    echo -e "${YELLOW}⚠️  .env not found in .gitignore (may be inherited)${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "${RED}❌ .gitignore not found${NC}"
  FOUND=1
fi

# Check for environment variable references (should be using process.env)
echo ""
echo -e "${YELLOW}Checking for proper environment variable usage...${NC}"

# Look for patterns that might indicate secrets being passed around
if grep -r "GOOGLE_CLIENT_SECRET\|DATABASE_PASSWORD\|JWT_SECRET" \
    --include="*.ts" \
    --include="*.js" \
    --include="*.tsx" \
    --include="*.jsx" \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=docs \
    --exclude-dir=scripts \
    . 2>/dev/null | \
    grep -v "process\.env\|import\.meta\.env" ; then
  echo -e "${YELLOW}⚠️  Found secret references not using environment variables:${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# Check for common secret file extensions
echo ""
echo -e "${YELLOW}Checking for common secret file types...${NC}"
DANGEROUS_FILES=$(find . \
  -type f \
  \( -name "*.key" -o -name "*.pem" -o -name "*.p12" -o -name "*.pfx" \
     -o -name "*secret*" -o -name "*password*" -o -name "*credentials*" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/.vercel/*" \
  -not -path "*/docs/*" \
  2>/dev/null || true)

if [ -n "$DANGEROUS_FILES" ]; then
  echo -e "${YELLOW}⚠️  Found potentially sensitive files:${NC}"
  echo "$DANGEROUS_FILES"
  WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo -e "${YELLOW}=== Verification Summary ===${NC}"

if [ $FOUND -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! No hardcoded secrets detected.${NC}"
  echo -e "${GREEN}✅ Safe to commit.${NC}"
  exit 0
elif [ $FOUND -eq 0 ] && [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Warnings detected (review above).${NC}"
  echo -e "${GREEN}✅ No critical secrets found.${NC}"
  exit 0
else
  echo -e "${RED}❌ CRITICAL: Secrets detected!${NC}"
  echo -e "${RED}❌ DO NOT COMMIT!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Review the matches above"
  echo "2. Remove or move secrets to .env"
  echo "3. Never commit secrets to version control"
  echo "4. Ensure .env is in .gitignore"
  echo ""
  exit 1
fi
