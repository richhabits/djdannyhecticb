#!/usr/bin/env bash
#
# ACTION: Nginx Reload
# Safely reloads nginx configuration after validation
#
# This is an IDEMPOTENT action - safe to run multiple times
#
set -euo pipefail

ACTION_NAME="nginx-reload"
LOG_FILE="${OPS_LOG_DIR:-/var/log/ops-agent}/${ACTION_NAME}.log"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"; }

# Parse arguments
DRY_RUN=true

for arg in "$@"; do
  case $arg in
    --execute) DRY_RUN=false ;;
    --dry-run) DRY_RUN=true ;;
    --help|-h) 
      echo "Usage: $0 [--dry-run|--execute]"
      echo "  --dry-run   Test config only (default)"
      echo "  --execute   Test and reload nginx"
      exit 0
      ;;
  esac
done

mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true

log "=== Nginx Reload Action Started ==="
log "Mode: $([ "$DRY_RUN" = true ] && echo 'DRY RUN' || echo 'EXECUTE')"

# Check if nginx is available
NGINX_CMD=""
if command -v nginx >/dev/null 2>&1; then
  NGINX_CMD="nginx"
elif docker ps --format '{{.Names}}' 2>/dev/null | grep -q nginx; then
  NGINX_CMD="docker exec hectic-nginx nginx"
  log "Using Docker nginx container"
fi

if [ -z "$NGINX_CMD" ]; then
  log "ERROR: Nginx not found (neither native nor Docker)"
  exit 1
fi

# Test configuration
log "Testing nginx configuration..."
if $NGINX_CMD -t 2>&1 | tee -a "$LOG_FILE"; then
  log "Configuration test: PASSED"
else
  log "Configuration test: FAILED"
  log "ERROR: Cannot reload with invalid config"
  exit 1
fi

if [ "$DRY_RUN" = true ]; then
  log ""
  log "DRY RUN - Configuration is valid"
  log "To reload: $0 --execute"
else
  # Require explicit approval
  if [ "${OPS_AGENT_APPROVAL:-0}" != "1" ]; then
    log "ERROR: OPS_AGENT_APPROVAL=1 required to execute"
    exit 1
  fi
  
  log "Reloading nginx..."
  
  if [ "$NGINX_CMD" = "nginx" ]; then
    systemctl reload nginx 2>&1 | tee -a "$LOG_FILE" || \
    nginx -s reload 2>&1 | tee -a "$LOG_FILE"
  else
    docker exec hectic-nginx nginx -s reload 2>&1 | tee -a "$LOG_FILE"
  fi
  
  log "Reload complete"
  
  # Verify nginx is running
  sleep 2
  if pgrep -x nginx >/dev/null 2>&1 || docker ps --format '{{.Names}}' | grep -q nginx; then
    log "Nginx status: RUNNING"
  else
    log "WARNING: Nginx may not be running correctly"
    exit 1
  fi
fi

log "=== Nginx Reload Action Complete ==="
