#!/usr/bin/env bash
# maintenance.sh: Nightly server cleanup (safe mode)
# Run via cron: 0 2 * * * /path/to/maintenance.sh >> /var/log/maintenance.log 2>&1
set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 Server Maintenance - $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Docker cleanup
echo "🐳 Docker cleanup..."
if command -v docker &> /dev/null; then
  # Remove stopped containers
  echo "  - Removing stopped containers..."
  docker container prune -f || true
  
  # Remove unused images
  echo "  - Removing unused images..."
  docker image prune -a -f --filter "until=72h" || true
  
  # Remove dangling volumes (SAFE: only unused)
  echo "  - Removing dangling volumes..."
  docker volume prune -f || true
  
  # Show disk usage
  echo "  - Docker disk usage:"
  docker system df
else
  echo "  ⚠️  Docker not found, skipping"
fi

# 2. Log rotation (if not using logrotate)
echo ""
echo "📝 Log rotation..."
LOG_DIRS=(
  "/var/log/djdannyhecticb"
  "/var/www/djdannyhecticb/logs"
  "$HOME/logs"
)

for LOG_DIR in "${LOG_DIRS[@]}"; do
  if [ -d "$LOG_DIR" ]; then
    echo "  - Rotating logs in $LOG_DIR..."
    find "$LOG_DIR" -name "*.log" -type f -mtime +7 -exec gzip {} \; 2>/dev/null || true
    find "$LOG_DIR" -name "*.log.gz" -type f -mtime +30 -delete 2>/dev/null || true
  fi
done

# 3. Temp files cleanup
echo ""
echo "🗑️  Temp files cleanup..."
TEMP_DIRS=(
  "/tmp"
  "/var/tmp"
)

for TEMP_DIR in "${TEMP_DIRS[@]}"; do
  if [ -d "$TEMP_DIR" ]; then
    echo "  - Cleaning $TEMP_DIR (files older than 7 days)..."
    find "$TEMP_DIR" -type f -mtime +7 -delete 2>/dev/null || true
  fi
done

# 4. Disk usage report
echo ""
echo "💾 Disk usage:"
df -h | grep -E "Filesystem|/$|/var|/home" || df -h

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Maintenance complete - $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
