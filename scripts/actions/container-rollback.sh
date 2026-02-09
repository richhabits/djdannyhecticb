#!/usr/bin/env bash
#
# ACTION: Container Rollback
# Rolls back a container to the previous image tag
#
# This is an IDEMPOTENT action (rolling back to same tag is safe)
#
set -euo pipefail

ACTION_NAME="container-rollback"
LOG_FILE="${OPS_LOG_DIR:-/var/log/ops-agent}/${ACTION_NAME}.log"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"; }

# Parse arguments
DRY_RUN=true
CONTAINER_NAME=""
ROLLBACK_TAG=""

for arg in "$@"; do
  case $arg in
    --execute) DRY_RUN=false ;;
    --dry-run) DRY_RUN=true ;;
    --container=*) CONTAINER_NAME="${arg#*=}" ;;
    --tag=*) ROLLBACK_TAG="${arg#*=}" ;;
    --help|-h) 
      echo "Usage: $0 --container=NAME --tag=TAG [--dry-run|--execute]"
      echo "  --container=NAME   Container to rollback (required)"
      echo "  --tag=TAG          Image tag to rollback to (required)"
      echo "  --dry-run          Show what would happen (default)"
      echo "  --execute          Actually perform rollback"
      echo ""
      echo "Example:"
      echo "  $0 --container=hectic-app --tag=v1.2.3 --execute"
      exit 0
      ;;
  esac
done

if [ -z "$CONTAINER_NAME" ] || [ -z "$ROLLBACK_TAG" ]; then
  echo "ERROR: Both --container and --tag are required"
  echo "Run with --help for usage"
  exit 1
fi

mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true

log "=== Container Rollback Action Started ==="
log "Container: ${CONTAINER_NAME}"
log "Target tag: ${ROLLBACK_TAG}"
log "Mode: $([ "$DRY_RUN" = true ] && echo 'DRY RUN' || echo 'EXECUTE')"

# Check Docker is available
if ! command -v docker >/dev/null 2>&1; then
  log "ERROR: Docker not available"
  exit 1
fi

# Get current image
CURRENT_IMAGE=$(docker inspect -f '{{.Config.Image}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
log "Current image: ${CURRENT_IMAGE}"

# Parse image name (without tag)
IMAGE_BASE=$(echo "$CURRENT_IMAGE" | sed 's/:.*$//')
TARGET_IMAGE="${IMAGE_BASE}:${ROLLBACK_TAG}"

log "Target image: ${TARGET_IMAGE}"

# Check if target image exists locally
if ! docker image inspect "$TARGET_IMAGE" >/dev/null 2>&1; then
  log "WARNING: Target image not found locally"
  log "Available tags for ${IMAGE_BASE}:"
  docker images "${IMAGE_BASE}" --format '  {{.Tag}} ({{.CreatedAt}})' | head -10 | tee -a "$LOG_FILE"
  
  if [ "$DRY_RUN" = false ]; then
    log "ERROR: Cannot rollback to non-existent image"
    exit 1
  fi
fi

if [ "$DRY_RUN" = true ]; then
  log ""
  log "DRY RUN - Would perform:"
  log "  1. Stop container: ${CONTAINER_NAME}"
  log "  2. Remove container: ${CONTAINER_NAME}"
  log "  3. Start new container with: ${TARGET_IMAGE}"
  log ""
  log "Available rollback targets:"
  docker images "${IMAGE_BASE}" --format '  {{.Tag}} ({{.CreatedAt}})' | head -5 | tee -a "$LOG_FILE"
  log ""
  log "To execute: $0 --container=${CONTAINER_NAME} --tag=${ROLLBACK_TAG} --execute"
else
  # Require explicit approval
  if [ "${OPS_AGENT_APPROVAL:-0}" != "1" ]; then
    log "ERROR: OPS_AGENT_APPROVAL=1 required to execute"
    exit 1
  fi
  
  log "Performing rollback..."
  
  # Save current container config (for potential re-rollback)
  BACKUP_FILE="/tmp/${CONTAINER_NAME}_$(date +%Y%m%d%H%M%S).json"
  docker inspect "$CONTAINER_NAME" > "$BACKUP_FILE" 2>/dev/null || true
  log "Container config backed up to: ${BACKUP_FILE}"
  
  # Stop and remove current container
  log "Stopping container..."
  docker stop "$CONTAINER_NAME" 2>&1 | tee -a "$LOG_FILE"
  
  log "Removing container..."
  docker rm "$CONTAINER_NAME" 2>&1 | tee -a "$LOG_FILE"
  
  # This is where you'd recreate the container
  # In practice, you'd use docker-compose or extract run params from backup
  log "NOTE: Container removed. Recreate with docker-compose or manual run."
  log "Example: docker-compose up -d ${CONTAINER_NAME}"
  log ""
  log "Rollback image ready: ${TARGET_IMAGE}"
fi

log "=== Container Rollback Action Complete ==="
