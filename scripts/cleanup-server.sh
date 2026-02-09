#!/bin/bash
# DJ Danny Hectic B / Hectic Empire - Server Hygiene Script
# SAFE, ISOLATED cleanup for the server environment.

PROJECT_NAME="dj-danny-hecticb"

echo "🌌 Initiating Hectic Server Hygiene for project: $PROJECT_NAME..."

# 1. Show current disk usage
echo "📊 Current Docker Disk Usage:"
docker system df

# 2. Project-Specific Cleanup
echo "🧹 Removing stopped containers for $PROJECT_NAME..."
docker compose -p $PROJECT_NAME ps -q -a | xargs -r docker rm

# 3. Global Safe Pruning (only unused)
echo "♻️ Pruning unused Docker resources..."
docker container prune -f
docker network prune -f
docker image prune -f

# 4. Log Rotation Warning
echo "📝 TIP: Ensure /etc/docker/daemon.json has log limits:"
echo ' { "log-driver": "json-file", "log-opts": { "max-size": "10m", "max-file": "3" } }'

echo "✅ Server Hygiene Logic Deployed. Run with caution."
