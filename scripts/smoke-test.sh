#!/bin/bash
# DJ Danny Hectic B / Hectic Empire - System Integrity Smoke Test
# Verifies that key routes and infrastructure are operational.

echo "🔍 Initiating Hectic Smoke Test..."

# 1. Check if server is running (assumes local dev if port 3000/5000 is default)
echo "📡 Checking API Connectivity..."
curl -s --head  --request GET http://localhost:5000/api/trpc/system.health | grep "200 OK" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ API Health: OPERATIONAL"
else
    echo "❌ API Health: UNREACHABLE (Check server logs)"
fi

# 2. Check Route Integrity (Intel)
echo "🛰️ Checking Intelligence Nodes (/intel)..."
curl -s http://localhost:5000/api/trpc/raveIntel.list | grep "result" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Intel Node: DATA FLOWING"
else
    echo "❌ Intel Node: SIGNAL LOST"
fi

# 3. Check Stream Integrity
echo "🌊 Checking Stream Telemetry..."
curl -s http://localhost:5000/api/trpc/streams.active | grep "result" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Stream Hub: CONNECTED"
else
    echo "⚠️ Stream Hub: OFFLINE (Expected if not broadcasting)"
fi

echo "🏁 Smoke Test Complete."
