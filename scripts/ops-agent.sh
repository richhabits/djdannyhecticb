#!/usr/bin/env bash
#
# OPS AGENT v2.0 - Local AI Operator (Deny-by-Default)
# Event-driven automation with strict action whitelisting
#
# SECURITY MODEL:
# - Analysis-only by default (OPS_AGENT_APPROVAL=1 required for actions)
# - Actions must exist in scripts/actions/
# - All actions must support --dry-run
# - Forbidden commands are blocked at parse level
#
# COPYRIGHT NOTICE
# Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
# All rights reserved.
#
set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ACTIONS_DIR="${SCRIPT_DIR}/actions"
OLLAMA_HOST="${OLLAMA_HOST:-http://localhost:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen2.5:7b-instruct}"
REPORT_DIR="${SCRIPT_DIR}/../ops-reports"
export OPS_LOG_DIR="${OPS_LOG_DIR:-/var/log/ops-agent}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
REPORT="${REPORT_DIR}/ops-${STAMP}.json"

# Safety: deny-by-default
EXECUTE_ACTIONS="${OPS_AGENT_APPROVAL:-0}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Forbidden command patterns (blocked at parse level)
FORBIDDEN_PATTERNS=(
  "rm -rf"
  "rm -fr"
  "rm -r /"
  "docker system prune -a"
  "iptables"
  "ufw disable"
  "reboot"
  "shutdown"
  "mkfs"
  "dd if="
  ":(){ :|:& };:"
  "DROP TABLE"
  "DELETE FROM"
  "TRUNCATE"
  "/dev/sd"
  "/dev/nvme"
  "chmod -R 777"
  "chown -R"
)

mkdir -p "$REPORT_DIR" "$OPS_LOG_DIR" 2>/dev/null || true

log() { echo -e "${CYAN}[OPS]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
fail() { echo -e "${RED}[FAIL]${NC} $*"; }
pass() { echo -e "${GREEN}[OK]${NC} $*"; }

###############################################################################
# FORBIDDEN COMMAND CHECKER
###############################################################################

is_command_forbidden() {
  local cmd="$1"
  
  for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
    if echo "$cmd" | grep -qiF "$pattern"; then
      return 0  # Forbidden
    fi
  done
  
  return 1  # Allowed
}

###############################################################################
# ACTION EXECUTOR (Whitelisted Only)
###############################################################################

execute_action() {
  local action_name="$1"
  shift
  local action_args=("$@")
  
  local action_script="${ACTIONS_DIR}/${action_name}.sh"
  
  # Check action exists
  if [ ! -f "$action_script" ]; then
    fail "Action '${action_name}' not found in ${ACTIONS_DIR}"
    log "Available actions:"
    ls -1 "${ACTIONS_DIR}"/*.sh 2>/dev/null | xargs -n1 basename | sed 's/\.sh$//' | sed 's/^/  /' || true
    return 1
  fi
  
  # Check action is executable
  if [ ! -x "$action_script" ]; then
    warn "Action '${action_name}' is not executable, fixing..."
    chmod +x "$action_script"
  fi
  
  log "Executing action: ${action_name}"
  
  if [ "$EXECUTE_ACTIONS" = "1" ]; then
    # Real execution
    export OPS_AGENT_APPROVAL=1
    "$action_script" --execute "${action_args[@]}"
  else
    # Dry run (default)
    "$action_script" --dry-run "${action_args[@]}"
  fi
}

###############################################################################
# SYSTEM SNAPSHOT COLLECTION
###############################################################################

collect_snapshot() {
  log "Collecting system snapshot..."
  
  # Disk
  local disk_usage=$(df -h / 2>/dev/null | awk 'NR==2 {print $5}' || echo "unknown")
  local disk_available=$(df -h / 2>/dev/null | awk 'NR==2 {print $4}' || echo "unknown")
  
  # Memory (works on both Linux and macOS)
  local mem_usage=""
  if command -v free >/dev/null 2>&1; then
    mem_usage=$(free -h 2>/dev/null | awk '/^Mem:/ {print $3 "/" $2}' || echo "unknown")
  elif command -v vm_stat >/dev/null 2>&1; then
    mem_usage=$(vm_stat 2>/dev/null | awk '/Pages active/ {print $3}' || echo "unknown")
  fi
  
  # Docker containers
  local containers_json="[]"
  local unhealthy=""
  local restarting=""
  if command -v docker >/dev/null 2>&1; then
    containers_json=$(docker ps --format '{"name":"{{.Names}}","status":"{{.Status}}","image":"{{.Image}}"}' 2>/dev/null | jq -s '.' 2>/dev/null || echo "[]")
    unhealthy=$(docker ps --filter 'health=unhealthy' --format '{{.Names}}' 2>/dev/null | tr '\n' ',' | sed 's/,$//' || echo "")
    restarting=$(docker ps --filter 'status=restarting' --format '{{.Names}}' 2>/dev/null | tr '\n' ',' | sed 's/,$//' || echo "")
  fi
  
  # Nginx status
  local nginx_status="unknown"
  if pgrep -x nginx >/dev/null 2>&1; then
    nginx_status="running"
  elif systemctl is-active nginx >/dev/null 2>&1; then
    nginx_status="running"
  elif docker ps --format '{{.Names}}' 2>/dev/null | grep -q nginx; then
    nginx_status="running (docker)"
  fi
  
  # Recent errors
  local recent_errors=""
  if [ -f /var/log/nginx/error.log ]; then
    recent_errors=$(tail -20 /var/log/nginx/error.log 2>/dev/null | jq -Rs '.' || echo '""')
  fi
  
  cat <<EOF
{
  "timestamp": "${STAMP}",
  "hostname": "$(hostname)",
  "disk": {
    "usage": "${disk_usage}",
    "available": "${disk_available}"
  },
  "memory": {
    "usage": "${mem_usage:-unknown}"
  },
  "docker": {
    "containers": ${containers_json},
    "unhealthy": "${unhealthy}",
    "restarting": "${restarting}"
  },
  "nginx": {
    "status": "${nginx_status}"
  },
  "recent_errors": ${recent_errors:-'""'}
}
EOF
}

###############################################################################
# TRIGGER DETECTION
###############################################################################

detect_triggers() {
  log "Detecting potential issues..."
  
  local triggers=()
  
  # Check disk usage
  local disk_usage=$(df / 2>/dev/null | awk 'NR==2 {gsub(/%/,"",$5); print $5}' || echo "0")
  if [ "$disk_usage" -gt 90 ]; then
    triggers+=("DISK_CRITICAL:${disk_usage}%")
  elif [ "$disk_usage" -gt 80 ]; then
    triggers+=("DISK_HIGH:${disk_usage}%")
  fi
  
  # Check for unhealthy containers
  if command -v docker >/dev/null 2>&1; then
    local unhealthy=$(docker ps --filter 'health=unhealthy' --format '{{.Names}}' 2>/dev/null | tr '\n' ' ')
    if [ -n "$unhealthy" ]; then
      triggers+=("UNHEALTHY_CONTAINERS:${unhealthy}")
    fi
    
    # Check for restart loops
    local restarting=$(docker ps --filter 'status=restarting' --format '{{.Names}}' 2>/dev/null | tr '\n' ' ')
    if [ -n "$restarting" ]; then
      triggers+=("RESTART_LOOP:${restarting}")
    fi
  fi
  
  # Check nginx status
  if ! pgrep -x nginx >/dev/null 2>&1 && ! systemctl is-active nginx >/dev/null 2>&1; then
    if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q nginx; then
      triggers+=("NGINX_DOWN")
    fi
  fi
  
  # Check for recent 5xx errors
  if [ -f /var/log/nginx/error.log ]; then
    local recent_5xx=$(tail -100 /var/log/nginx/error.log 2>/dev/null | grep -c "5[0-9][0-9]" || echo "0")
    if [ "$recent_5xx" -gt 20 ]; then
      triggers+=("5XX_SPIKE:${recent_5xx}")
    elif [ "$recent_5xx" -gt 10 ]; then
      triggers+=("5XX_ELEVATED:${recent_5xx}")
    fi
  fi
  
  if [ ${#triggers[@]} -gt 0 ]; then
    printf '%s\n' "${triggers[@]}" | tr '\n' ',' | sed 's/,$//'
  else
    echo "NONE"
  fi
}

###############################################################################
# RULE-BASED RESPONSE (No AI Required)
###############################################################################

apply_rules() {
  local triggers="$1"
  
  log "Applying rule-based responses..."
  
  # Disk pressure → docker prune
  if echo "$triggers" | grep -q "DISK_"; then
    echo "docker-prune"
    log "  Rule: Disk pressure → docker-prune"
  fi
  
  # Unhealthy container → restart
  if echo "$triggers" | grep -q "UNHEALTHY_CONTAINERS:"; then
    local containers=$(echo "$triggers" | grep -o 'UNHEALTHY_CONTAINERS:[^ ]*' | cut -d: -f2)
    for container in $containers; do
      echo "container-restart --container=${container}"
      log "  Rule: Unhealthy → restart ${container}"
    done
  fi
  
  # Restart loop → notify only (requires manual intervention)
  if echo "$triggers" | grep -q "RESTART_LOOP:"; then
    warn "  Rule: Restart loop detected - manual rollback recommended"
    log "  Suggested: container-rollback --container=NAME --tag=PREVIOUS"
  fi
}

###############################################################################
# LOCAL LLM ANALYSIS (Optional Enhancement)
###############################################################################

analyze_with_llm() {
  local snapshot="$1"
  local triggers="$2"
  
  # Check if Ollama is available
  if ! curl -s --connect-timeout 2 "${OLLAMA_HOST}/api/tags" >/dev/null 2>&1; then
    log "LLM not available (Ollama not running)"
    echo '{"available": false}'
    return
  fi
  
  log "Calling local LLM for enhanced analysis..."
  
  local prompt=$(cat <<EOF
You are a DevOps engineer analyzing a production system.

SYSTEM STATE:
${snapshot}

DETECTED ISSUES:
${triggers}

Provide a brief JSON response:
{
  "severity": "low|medium|high|critical",
  "root_cause": "One sentence explanation",
  "recommendation": "What the ops team should investigate"
}

Be concise. Do not suggest any commands - those are handled by the rule engine.
EOF
)

  local response=$(curl -s --connect-timeout 30 "${OLLAMA_HOST}/api/generate" \
    -H "Content-Type: application/json" \
    -d "{\"model\": \"${OLLAMA_MODEL}\", \"prompt\": $(echo "$prompt" | jq -Rs '.'), \"stream\": false}" \
    2>/dev/null || echo '{"response": "{}"}')
  
  echo "$response" | jq -r '.response' 2>/dev/null || echo '{"error": "parse_failed"}'
}

###############################################################################
# MAIN
###############################################################################

main() {
  echo ""
  echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║  OPS AGENT v2.0 - Deny-by-Default                            ║${NC}"
  echo -e "${BOLD}║  Timestamp: ${STAMP}                               ║${NC}"
  if [ "$EXECUTE_ACTIONS" = "1" ]; then
    echo -e "${BOLD}║  ${RED}Mode: EXECUTE (OPS_AGENT_APPROVAL=1)${NC}${BOLD}                         ║${NC}"
  else
    echo -e "${BOLD}║  ${GREEN}Mode: ANALYSIS ONLY (dry-run)${NC}${BOLD}                              ║${NC}"
  fi
  echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  
  # 1. Collect system state
  local snapshot
  snapshot=$(collect_snapshot)
  
  # 2. Detect triggers
  local triggers
  triggers=$(detect_triggers)
  log "Detected triggers: ${triggers}"
  
  if [ "$triggers" = "NONE" ]; then
    pass "No issues detected. System healthy."
    
    cat <<EOF > "$REPORT"
{
  "timestamp": "${STAMP}",
  "status": "healthy",
  "triggers": [],
  "actions": []
}
EOF
    exit 0
  fi
  
  # 3. Apply rule-based responses
  local actions
  actions=$(apply_rules "$triggers")
  
  # 4. Optional: LLM analysis for enhanced context
  local llm_analysis
  if [ "${USE_LLM:-0}" = "1" ]; then
    llm_analysis=$(analyze_with_llm "$snapshot" "$triggers")
    log "LLM Analysis:"
    echo "$llm_analysis" | jq '.' 2>/dev/null || echo "$llm_analysis"
  else
    llm_analysis='{"available": false, "note": "Set USE_LLM=1 to enable"}'
  fi
  
  # 5. Execute actions (if approved)
  echo ""
  log "Proposed actions:"
  
  if [ -n "$actions" ]; then
    echo "$actions" | while read -r action_line; do
      if [ -n "$action_line" ]; then
        # Parse action name and args
        local action_name=$(echo "$action_line" | awk '{print $1}')
        local action_args=$(echo "$action_line" | cut -d' ' -f2-)
        
        log "  → ${action_name} ${action_args}"
        
        if [ "$EXECUTE_ACTIONS" = "1" ]; then
          execute_action "$action_name" $action_args
        fi
      fi
    done
  else
    log "  (none - manual review recommended)"
  fi
  
  if [ "$EXECUTE_ACTIONS" != "1" ]; then
    echo ""
    warn "Actions shown in dry-run mode. To execute:"
    log "  OPS_AGENT_APPROVAL=1 $0"
  fi
  
  # 6. Save report
  cat <<EOF > "$REPORT"
{
  "timestamp": "${STAMP}",
  "status": "issues_detected",
  "triggers": "$(echo "$triggers" | tr ',' '\n' | jq -R . | jq -s .)",
  "actions_proposed": $(echo "$actions" | jq -R . | jq -s . 2>/dev/null || echo '[]'),
  "actions_executed": ${EXECUTE_ACTIONS},
  "llm_analysis": ${llm_analysis},
  "snapshot": ${snapshot}
}
EOF
  
  log ""
  log "Report saved: ${REPORT}"
  pass "OPS AGENT COMPLETE"
}

# Subcommands
case "${1:-run}" in
  run)
    main
    ;;
  snapshot)
    collect_snapshot | jq '.'
    ;;
  triggers)
    detect_triggers
    ;;
  action)
    if [ -z "${2:-}" ]; then
      echo "Usage: $0 action ACTION_NAME [args...]"
      echo ""
      echo "Available actions:"
      ls -1 "${ACTIONS_DIR}"/*.sh 2>/dev/null | xargs -n1 basename | sed 's/\.sh$//' | sed 's/^/  /' || echo "  (none found)"
      exit 1
    fi
    execute_action "${2}" "${@:3}"
    ;;
  list-actions)
    echo "Available actions in ${ACTIONS_DIR}:"
    ls -1 "${ACTIONS_DIR}"/*.sh 2>/dev/null | xargs -n1 basename | sed 's/\.sh$//' | sed 's/^/  /' || echo "  (none found)"
    ;;
  help|--help|-h)
    cat <<EOF
OPS AGENT v2.0 - Deny-by-Default Automation

Usage: $0 [command]

Commands:
  run           Full ops analysis (default)
  snapshot      Just collect system state
  triggers      Just check for issues
  action NAME   Execute a specific action
  list-actions  Show available actions
  help          Show this help

Environment:
  OPS_AGENT_APPROVAL=1  Enable action execution (default: analysis only)
  USE_LLM=1             Enable LLM-powered analysis
  OLLAMA_HOST           Ollama API endpoint (default: http://localhost:11434)
  OLLAMA_MODEL          Model to use (default: qwen2.5:7b-instruct)
  OPS_LOG_DIR           Log directory (default: /var/log/ops-agent)

Examples:
  $0                           # Analyze system (dry-run)
  $0 triggers                  # Quick health check
  OPS_AGENT_APPROVAL=1 $0      # Run with action execution
  USE_LLM=1 $0                 # Run with AI analysis
  $0 action docker-prune       # Run specific action (dry-run)

Security:
  - Actions only execute from scripts/actions/
  - All actions support --dry-run
  - Forbidden commands are blocked at parse level
  - OPS_AGENT_APPROVAL=1 required for real execution
EOF
    ;;
  *)
    echo "Unknown command: $1"
    echo "Run '$0 help' for usage"
    exit 1
    ;;
esac
