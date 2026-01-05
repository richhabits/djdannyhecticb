#!/bin/bash
# /var/www/djdannyhecticb/scripts/daily-maintenance.sh
# Automated daily maintenance for DjDannyHecticB

LOG_FILE="/var/www/djdannyhecticb/logs/maintenance.log"
mkdir -p "$(dirname "$LOG_FILE")"

echo "------------------------------------------------" >> "$LOG_FILE"
echo "Maintenance started at $(date)" >> "$LOG_FILE"

# 1. Docker Prune (Keep last 24h to be safe, or aggressive prune if space is low)
# Removing unused containers, networks, and images (not volumes to be safe)
docker system prune -a -f --filter "until=24h" >> "$LOG_FILE" 2>&1

# 2. Rotate Docker Logs (Truncate if > 10MB)
echo "Rotating docker logs..." >> "$LOG_FILE"
find /var/lib/docker/containers/ -name "*-json.log" -size +10M -print0 | while IFS= read -r -d '' file; do
  echo "Truncating $file" >> "$LOG_FILE"
  truncate -s 0 "$file"
done

# 3. Simple Backup (Database Dump)
# Adjust container name if needed (djdannyhecticb-db-1)
BACKUP_DIR="/var/www/djdannyhecticb/backups"
mkdir -p "$BACKUP_DIR"
# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete >> "$LOG_FILE" 2>&1

echo "Creating DB backup..." >> "$LOG_FILE"
docker exec djdannyhecticb-db-1 mysqldump -u root -proot djdannyhecticb | gzip > "$BACKUP_DIR/db_backup_$(date +\%F).sql.gz"

echo "Maintenance completed at $(date)" >> "$LOG_FILE"
echo "------------------------------------------------" >> "$LOG_FILE"
