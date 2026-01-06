#!/bin/bash
echo "=== AUDIT REPORT: IP PROTECTION & CODE CLEANLINESS ==="
echo ""
echo "## 1. IP Protection Check (Copyright Headers)"
echo "Checking client/src/pages for Copyright Notice..."
MISSING_COPYRIGHT=$(grep -L "COPYRIGHT NOTICE" client/src/pages/*.tsx)
if [ -z "$MISSING_COPYRIGHT" ]; then
  echo "✅ ALL PAGES HAVE COPYRIGHT HEADERS"
else
  echo "⚠️  THE FOLLOWING PAGES MISS COPYRIGHT HEADERS:"
  echo "$MISSING_COPYRIGHT"
fi

echo ""
echo "## 2. Clean Code Check (Console Logs)"
LOGS=$(grep -r "console.log" client/src/pages --include="*.tsx" | grep -v "test")
if [ -z "$LOGS" ]; then
  echo "✅ NO CONSOLE LOGS FOUND"
else
  echo "⚠️  CONSOLE LOGS FOUND IN:"
  echo "$LOGS"
fi

echo ""
echo "## 3. Deployment Verification"
echo "Checking if remote server responds..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://djdannyhecticb.com/api/health)
if [ "$STATUS" == "200" ] || [ "$STATUS" == "404" ]; then # 404 might happen if route does not exist yet but server is up
    echo "✅ SERVER IS REACHABLE (Status: $STATUS)"
else
    echo "⚠️  SERVER CHECK FAILED (Status: $STATUS)"
fi
