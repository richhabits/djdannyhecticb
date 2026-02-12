#!/bin/bash

echo "📋 PR Cleanup Documentation Verification"
echo "========================================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
TOTAL=0

check() {
  local file="$1"
  local desc="$2"
  ((TOTAL++))
  
  if [ -f "$file" ]; then
    size=$(du -h "$file" | awk '{print $1}')
    echo -e "${GREEN}✓${NC} $desc ($size)"
    ((PASS++))
  else
    echo -e "${YELLOW}✗${NC} $desc (missing)"
  fi
}

echo "Core Documentation:"
check "README_PR_CLEANUP.md" "README - Start Here"
check "ACTION_PLAN.md" "Action Plan - Execution Guide"
check "EXECUTIVE_SUMMARY.md" "Executive Summary - Overview"

echo ""
echo "Technical Documentation:"
check "PR_CONSOLIDATION_ANALYSIS.md" "PR Analysis - Technical Details"
check "PR_CLOSURE_MESSAGES.md" "Closure Messages - Templates"
check "RELEASE_NOTES_TEMPLATE.md" "Release Notes - v1.0.0"

echo ""
echo "Verification:"
check "CLEANUP_VERIFICATION_CHECKLIST.md" "Verification Checklist"

echo ""
echo "========================================"
echo "Documentation: $PASS/$TOTAL files present"

if [ $PASS -eq $TOTAL ]; then
  echo -e "${GREEN}✓ All documentation complete!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Read README_PR_CLEANUP.md (start here)"
  echo "2. Follow ACTION_PLAN.md (step-by-step)"
  echo "3. Use other docs as reference"
  echo ""
  echo "Estimated time: 75 minutes"
  echo "Result: Clean repo + v1.0.0 release"
else
  echo -e "${YELLOW}⚠ Some documentation missing${NC}"
fi
