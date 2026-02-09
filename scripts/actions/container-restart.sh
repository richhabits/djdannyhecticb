#!/usr/bin/env bash
#
# ACTION: Restart Container
# Restarts a specific Docker container by name
#
# This is an IDEMPOTENT action - safe to run multiple times
#
set -euo pipefail

ACTION_NAME="container-restart"
LOG_FILE="${OPS_LOG_DIR:-/var/log/ops-agent}/${ACTION_NAME}.log"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"; }

# Parse arguments
DRY_RUN=true
CONTAINER_NAME=""

for arg in "$@"; do
  case $arg in
    --execute) DRY_RUN=false ;;
    --dry-run) DRY_RUN=true ;;
    --container=*) CONTAINER_NAME="${arg#*=}" ;;
    --help|-h) 
      echo "Usage: $0 --container=NAME [--dry-run|--execute]"
      echo "  --container=NAME   Container to restart (required)"
      echo "  --dry-run          Show what would happen (default)"
      echo "  --execute          Actually restart the container"
      exit 0
      ;;
  esac
done

if [ -z "$CONTAINER_NAME" ]; then
  echo "ERROR: --container=NAME is required"
  exit 1
fi

mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true

log "=== Container Restart Action Started ==="
log "Container: ${CONTAINER_NAME}"
log "Mode: $([ "$DRY_RUN" = true ] && echo 'DRY RUN' || echo 'EXECUTE')"

# Check Docker is available
if ! command -v docker >/dev/null 2>&1; then
  log "ERROR: Docker not available"
  exit 1
fi

# Check container exists
if ! docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  log "ERROR: Container '${CONTAINER_NAME}' not found"
  log "Available containers:"
  docker ps -a --format '  {{.Names}} ({{.Status}})' | tee -a "$LOG_FILE"
  exit 1
fi

# Get current status
CURRENT_STATUS=$(docker inspect -f '{{.State.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
log "Current status: ${CURRENT_STATUS}"

if [ "$DRY_RUN" = true ]; then
  log "DRY RUN - Would restart container: ${CONTAINER_NAME}"
  log ""
  log "To execute: $0 --container=${CONTAINER_NAME} --execute"
else
  # Require explicit approval
  if [ "${OPS_AGENT_APPROVAL:-0}" != "1" ]; then
    log "ERROR: OPS_AGENT_APPROVAL=1 required to execute"
    exit 1
  fi
  
  log "Restarting container..."
  
  docker restart "$CONTAINER_NAME" 2>&1 | tee -a "$LOG_FILE"
  
  # Wait for container to be healthy
  sleep 5
  
  NEW_STATUS=$(docker inspect -f '{{.State.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
  log "New status: ${NEW_STATUS}"
  
  if [ "$NEW_STATUS" = "running" ]; then
    log "Container restarted successfully"
  else
    log "WARNING: Container may not have started correctly"
    exit 1
  fi
fi

log "=== Container Restart Action Complete ==="
