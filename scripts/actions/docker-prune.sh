#!/usr/bin/env bash
#
# ACTION: Docker Prune (Safe)
# Removes only unused containers, networks, and dangling images
# Does NOT use -a flag (preserves tagged images)
#
# This is an IDEMPOTENT action - safe to run multiple times
#
set -euo pipefail

ACTION_NAME="docker-prune"
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
      echo "  --dry-run   Show what would be removed (default)"
      echo "  --execute   Actually perform the prune"
      exit 0
      ;;
  esac
done

mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true

log "=== Docker Prune Action Started ==="
log "Mode: $([ "$DRY_RUN" = true ] && echo 'DRY RUN' || echo 'EXECUTE')"

# Check Docker is available
if ! command -v docker >/dev/null 2>&1; then
  log "ERROR: Docker not available"
  exit 1
fi

# Get current disk usage
log "Current disk usage:"
df -h / | tee -a "$LOG_FILE"

# Get Docker disk usage
log "Docker disk usage:"
docker system df 2>/dev/null | tee -a "$LOG_FILE" || log "Could not get Docker disk usage"

if [ "$DRY_RUN" = true ]; then
  log "DRY RUN - Would remove:"
  
  # Show what would be removed
  log "Stopped containers:"
  docker ps -a --filter 'status=exited' --format '  {{.Names}} ({{.Status}})' | tee -a "$LOG_FILE" || true
  
  log "Dangling images:"
  docker images -f 'dangling=true' --format '  {{.Repository}}:{{.Tag}} ({{.Size}})' | tee -a "$LOG_FILE" || true
  
  log "Unused networks:"
  docker network ls --filter 'dangling=true' --format '  {{.Name}}' | tee -a "$LOG_FILE" || true
  
  log ""
  log "To execute: $0 --execute"
else
  # Require explicit approval
  if [ "${OPS_AGENT_APPROVAL:-0}" != "1" ]; then
    log "ERROR: OPS_AGENT_APPROVAL=1 required to execute"
    log "Set environment variable or run manually with approval"
    exit 1
  fi
  
  log "Executing prune..."
  
  # Safe prune (no -a, preserves tagged images)
  docker container prune -f 2>&1 | tee -a "$LOG_FILE"
  docker network prune -f 2>&1 | tee -a "$LOG_FILE"
  docker image prune -f 2>&1 | tee -a "$LOG_FILE"  # Only dangling
  
  log "Prune complete"
  
  log "New Docker disk usage:"
  docker system df 2>/dev/null | tee -a "$LOG_FILE" || true
fi

log "=== Docker Prune Action Complete ==="
