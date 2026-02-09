#!/usr/bin/env bash
#
# ACTION: Log Rotation
# Rotates and compresses log files older than threshold
#
# This is an IDEMPOTENT action - safe to run multiple times
#
set -euo pipefail

ACTION_NAME="log-rotate"
LOG_FILE="${OPS_LOG_DIR:-/var/log/ops-agent}/${ACTION_NAME}.log"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"; }

# Parse arguments
DRY_RUN=true
LOG_DIR=""
MAX_AGE_DAYS=7

for arg in "$@"; do
  case $arg in
    --execute) DRY_RUN=false ;;
    --dry-run) DRY_RUN=true ;;
    --dir=*) LOG_DIR="${arg#*=}" ;;
    --max-age=*) MAX_AGE_DAYS="${arg#*=}" ;;
    --help|-h) 
      echo "Usage: $0 --dir=/path/to/logs [--max-age=7] [--dry-run|--execute]"
      echo "  --dir=PATH     Directory containing logs (required)"
      echo "  --max-age=N    Compress logs older than N days (default: 7)"
      echo "  --dry-run      Show what would happen (default)"
      echo "  --execute      Actually rotate logs"
      exit 0
      ;;
  esac
done

if [ -z "$LOG_DIR" ]; then
  echo "ERROR: --dir=/path/to/logs is required"
  exit 1
fi

if [ ! -d "$LOG_DIR" ]; then
  echo "ERROR: Directory '${LOG_DIR}' does not exist"
  exit 1
fi

mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true

log "=== Log Rotation Action Started ==="
log "Directory: ${LOG_DIR}"
log "Max age: ${MAX_AGE_DAYS} days"
log "Mode: $([ "$DRY_RUN" = true ] && echo 'DRY RUN' || echo 'EXECUTE')"

# Find old log files
OLD_LOGS=$(find "$LOG_DIR" -name '*.log' -type f -mtime +${MAX_AGE_DAYS} 2>/dev/null || true)
OLD_COUNT=$(echo "$OLD_LOGS" | grep -c '.' || echo "0")

log "Found ${OLD_COUNT} log files older than ${MAX_AGE_DAYS} days"

if [ "$DRY_RUN" = true ]; then
  log "DRY RUN - Would compress:"
  echo "$OLD_LOGS" | while read -r file; do
    [ -n "$file" ] && log "  ${file}"
  done
  
  # Show current disk usage
  log ""
  log "Current log directory size:"
  du -sh "$LOG_DIR" 2>/dev/null | tee -a "$LOG_FILE" || true
  
  log ""
  log "To execute: $0 --dir=${LOG_DIR} --execute"
else
  # Require explicit approval
  if [ "${OPS_AGENT_APPROVAL:-0}" != "1" ]; then
    log "ERROR: OPS_AGENT_APPROVAL=1 required to execute"
    exit 1
  fi
  
  log "Compressing old logs..."
  
  COMPRESSED=0
  echo "$OLD_LOGS" | while read -r file; do
    if [ -n "$file" ] && [ -f "$file" ]; then
      gzip -9 "$file" 2>&1 | tee -a "$LOG_FILE" && ((COMPRESSED++)) || true
      log "  Compressed: ${file}"
    fi
  done
  
  log "Compressed ${COMPRESSED} files"
  
  # Show new disk usage
  log "New log directory size:"
  du -sh "$LOG_DIR" 2>/dev/null | tee -a "$LOG_FILE" || true
fi

log "=== Log Rotation Action Complete ==="
