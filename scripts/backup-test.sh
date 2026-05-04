#!/bin/bash

################################################################################
# Database Backup Testing & Validation Script
#
# Purpose: Test backup integrity and restore procedures
# Usage: ./scripts/backup-test.sh [--full | --validate | --restore FILE]
#
# Environment Requirements:
#   - supabase CLI installed
#   - psql installed
#   - DATABASE_URL environment variable set
#
################################################################################

set -euo pipefail

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_REF="ujxncnmoccotlssnqzwx"
BACKUP_DIR="${BACKUP_DIR:-./.backups}"
LOG_FILE="${BACKUP_DIR}/backup_test_$(date +%Y%m%d_%H%M%S).log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

################################################################################
# Logging Functions
################################################################################

log() {
  echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
  echo -e "${GREEN}[✓]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
  echo -e "${RED}[✗] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
  echo -e "${YELLOW}[!] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
  echo -e "${BLUE}[i]${NC} $1" | tee -a "$LOG_FILE"
}

################################################################################
# Utility Functions
################################################################################

check_prerequisites() {
  log "Checking prerequisites..."

  local missing=0

  if ! command -v supabase &> /dev/null; then
    error "supabase CLI not found. Install with: npm install -g supabase"
    ((missing++))
  else
    success "supabase CLI found: $(supabase version)"
  fi

  if ! command -v psql &> /dev/null; then
    error "psql not found. Install PostgreSQL client tools"
    ((missing++))
  else
    success "psql found: $(psql --version)"
  fi

  if [ -z "${DATABASE_URL:-}" ]; then
    error "DATABASE_URL environment variable not set"
    ((missing++))
  else
    success "DATABASE_URL is configured"
  fi

  if [ $missing -gt 0 ]; then
    error "Missing $missing prerequisite(s). Cannot continue."
    exit 1
  fi
}

get_database_size() {
  psql "$DATABASE_URL" -t -c "
    SELECT pg_size_pretty(pg_database_size(current_database())) AS size;
  "
}

get_table_stats() {
  psql "$DATABASE_URL" -t -c "
    SELECT
      schemaname || '.' || tablename AS table_name,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
      n_live_tup AS row_count
    FROM pg_tables
    LEFT JOIN pg_stat_user_tables ON pg_tables.schemaname = pg_stat_user_tables.schemaname
      AND pg_tables.tablename = pg_stat_user_tables.relname
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
  "
}

count_records() {
  local table=$1
  psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM $table;"
}

################################################################################
# Backup Functions
################################################################################

create_backup() {
  log "Creating database backup..."

  local backup_file="${BACKUP_DIR}/backup_${PROJECT_REF}_$(date +%Y%m%d_%H%M%S).sql"
  local compressed_file="${backup_file}.gz"

  info "Backup file: $backup_file"

  # Create backup using pg_dump
  if pg_dump "$DATABASE_URL" --format=plain > "$backup_file" 2>> "$LOG_FILE"; then
    local size_uncompressed=$(du -h "$backup_file" | cut -f1)
    success "Backup created: $size_uncompressed"

    # Compress backup
    log "Compressing backup..."
    if gzip "$backup_file"; then
      local size_compressed=$(du -h "$compressed_file" | cut -f1)
      success "Backup compressed: $size_compressed"

      # Store metadata
      echo "timestamp=$(date +%s)" > "${compressed_file}.meta"
      echo "size_uncompressed=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file")" >> "${compressed_file}.meta"
      echo "database_size=$(get_database_size)" >> "${compressed_file}.meta"

      echo "$compressed_file"
      return 0
    else
      error "Failed to compress backup"
      return 1
    fi
  else
    error "Failed to create backup"
    return 1
  fi
}

validate_backup() {
  local backup_file=$1

  log "Validating backup: $backup_file"

  if [ ! -f "$backup_file" ]; then
    error "Backup file not found: $backup_file"
    return 1
  fi

  # Check file size
  local size=$(du -h "$backup_file" | cut -f1)
  info "Backup file size: $size"

  # Check if gzipped
  if [[ "$backup_file" == *.gz ]]; then
    info "File is gzipped"

    # Test gzip integrity
    log "Testing gzip integrity..."
    if gzip -t "$backup_file" 2>> "$LOG_FILE"; then
      success "Gzip integrity verified"
    else
      error "Gzip file is corrupted"
      return 1
    fi

    # Decompress to temp file for validation
    local uncompressed="${backup_file%.gz}.tmp"
    gunzip -k "$backup_file" -O "$uncompressed" 2>> "$LOG_FILE"
    backup_file="$uncompressed"
  fi

  # Check SQL syntax (first 100 lines)
  log "Checking SQL syntax..."
  if head -100 "$backup_file" | grep -q "CREATE TABLE\|INSERT INTO"; then
    success "SQL syntax appears valid"
  else
    warning "Could not find SQL statements in backup file"
  fi

  # Count statements
  local statement_count=$(grep -c "^--\|^CREATE\|^INSERT\|^UPDATE\|^DELETE" "$backup_file" || true)
  info "SQL statements found: $statement_count"

  # Cleanup temp file
  rm -f "${backup_file%.tmp}"

  return 0
}

################################################################################
# Restore Functions
################################################################################

restore_backup() {
  local backup_file=$1

  log "Preparing to restore from: $backup_file"

  if [ ! -f "$backup_file" ]; then
    error "Backup file not found: $backup_file"
    return 1
  fi

  warning "THIS WILL OVERWRITE THE CURRENT DATABASE!"
  warning "Database URL: $DATABASE_URL"

  read -p "Are you sure you want to proceed? Type 'RESTORE' to continue: " confirm

  if [ "$confirm" != "RESTORE" ]; then
    info "Restore cancelled"
    return 0
  fi

  log "Starting restore process..."

  # Decompress if needed
  local restore_file="$backup_file"
  if [[ "$backup_file" == *.gz ]]; then
    restore_file="${backup_file%.gz}"
    log "Decompressing backup..."
    gunzip -k "$backup_file" 2>> "$LOG_FILE"
  fi

  # Perform restore
  if psql "$DATABASE_URL" < "$restore_file" >> "$LOG_FILE" 2>&1; then
    success "Restore completed successfully"

    # Verify restore
    log "Verifying restored data..."
    verify_restore

    return 0
  else
    error "Restore failed. Check log: $LOG_FILE"
    return 1
  fi
}

################################################################################
# Verification Functions
################################################################################

verify_restore() {
  log "Running restore verification checks..."

  local checks_passed=0
  local checks_total=0

  # Check 1: Table count
  ((checks_total++))
  log "Checking table count..."
  local table_count=$(psql "$DATABASE_URL" -t -c "
    SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
  ")

  if [ "$table_count" -gt 0 ]; then
    success "Found $table_count tables"
    ((checks_passed++))
  else
    error "No tables found in public schema"
  fi

  # Check 2: Critical tables
  ((checks_total++))
  log "Checking critical tables..."
  local critical_tables=("live_sessions" "chat_messages" "donations" "streamer_stats")
  local missing_tables=0

  for table in "${critical_tables[@]}"; do
    if psql "$DATABASE_URL" -t -c "SELECT 1 FROM information_schema.tables WHERE table_name='$table' AND table_schema='public';" | grep -q 1; then
      info "  ✓ $table"
    else
      warning "  ✗ $table (missing)"
      ((missing_tables++))
    fi
  done

  if [ $missing_tables -eq 0 ]; then
    success "All critical tables present"
    ((checks_passed++))
  else
    error "$missing_tables critical table(s) missing"
  fi

  # Check 3: Foreign key integrity
  ((checks_total++))
  log "Checking foreign key constraints..."
  local fk_violations=$(psql "$DATABASE_URL" -t -c "
    SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';
  ")

  if [ "$fk_violations" -gt 0 ]; then
    success "Found $fk_violations foreign key constraints"
    ((checks_passed++))
  else
    warning "No foreign keys found (may be normal)"
  fi

  # Check 4: Index integrity
  ((checks_total++))
  log "Checking indexes..."
  local index_count=$(psql "$DATABASE_URL" -t -c "
    SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';
  ")

  if [ "$index_count" -gt 0 ]; then
    success "Found $index_count indexes"
    ((checks_passed++))
  else
    warning "No indexes found"
  fi

  # Summary
  echo ""
  info "Verification Summary: $checks_passed/$checks_total checks passed"

  if [ $checks_passed -eq $checks_total ]; then
    success "Restore verification completed successfully"
    return 0
  else
    warning "Restore verification had some issues"
    return 1
  fi
}

################################################################################
# Report Functions
################################################################################

generate_report() {
  log "Generating backup report..."

  local report_file="${BACKUP_DIR}/backup_report_$(date +%Y%m%d_%H%M%S).txt"

  {
    echo "==============================================="
    echo "Database Backup Report"
    echo "==============================================="
    echo "Generated: $TIMESTAMP"
    echo "Project: $PROJECT_REF"
    echo ""

    echo "CURRENT DATABASE STATUS"
    echo "-----------------------------------------------"
    echo "Database Size: $(get_database_size)"
    echo "Database URL: ${DATABASE_URL%@*}@..."
    echo ""

    echo "TABLE STATISTICS"
    echo "-----------------------------------------------"
    get_table_stats
    echo ""

    echo "BACKUP FILES"
    echo "-----------------------------------------------"
    ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | awk '{print $9, "(" $5 ")"}'
    echo ""

    echo "RECENT BACKUP TESTS"
    echo "-----------------------------------------------"
    if [ -f "$LOG_FILE" ]; then
      tail -20 "$LOG_FILE"
    fi

  } | tee "$report_file"

  success "Report saved: $report_file"
}

################################################################################
# Main Functions
################################################################################

run_full_test() {
  log "Running full backup test cycle..."

  # Check prerequisites
  check_prerequisites

  # Show current state
  log "Current database state:"
  info "Size: $(get_database_size)"

  # Create backup
  BACKUP_FILE=$(create_backup)
  if [ $? -ne 0 ]; then
    error "Backup creation failed"
    exit 1
  fi

  # Validate backup
  validate_backup "$BACKUP_FILE"
  if [ $? -ne 0 ]; then
    error "Backup validation failed"
    exit 1
  fi

  success "Full backup test completed successfully"
  success "Backup saved: $BACKUP_FILE"
}

run_validation_only() {
  check_prerequisites

  log "Finding latest backup..."
  local latest_backup=$(ls -t "${BACKUP_DIR}"/backup_*.sql.gz 2>/dev/null | head -1)

  if [ -z "$latest_backup" ]; then
    error "No backup files found in $BACKUP_DIR"
    exit 1
  fi

  validate_backup "$latest_backup"
}

print_usage() {
  cat << EOF
Database Backup Testing & Validation Script

Usage: $0 [COMMAND]

Commands:
  --full              Run complete backup test cycle (create + validate)
  --validate          Validate the latest backup file
  --restore FILE      Restore from backup file (DESTRUCTIVE)
  --report            Generate backup report
  --help              Show this help message

Environment Variables:
  DATABASE_URL        PostgreSQL connection string (required)
  BACKUP_DIR          Backup directory (default: ./.backups)

Examples:
  # Create and validate a backup
  ./scripts/backup-test.sh --full

  # Validate existing backup
  ./scripts/backup-test.sh --validate

  # Generate report
  ./scripts/backup-test.sh --report

  # Restore from specific backup
  DATABASE_URL="postgresql://..." ./scripts/backup-test.sh --restore ./.backups/backup_*.sql.gz

EOF
}

################################################################################
# Main Execution
################################################################################

main() {
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║     Database Backup Testing & Validation Script           ║${NC}"
  echo -e "${BLUE}║     Project: $PROJECT_REF                    ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""

  log "Test started at $TIMESTAMP"
  log "Log file: $LOG_FILE"

  case "${1:-}" in
    --full)
      run_full_test
      generate_report
      ;;
    --validate)
      run_validation_only
      ;;
    --restore)
      if [ -z "${2:-}" ]; then
        error "Backup file path required for --restore"
        print_usage
        exit 1
      fi
      restore_backup "$2"
      ;;
    --report)
      generate_report
      ;;
    --help|-h)
      print_usage
      ;;
    *)
      if [ -n "${1:-}" ]; then
        error "Unknown command: $1"
      fi
      print_usage
      exit 1
      ;;
  esac

  log "Test completed at $(date '+%Y-%m-%d %H:%M:%S')"
  echo ""
}

# Run main function
main "$@"
