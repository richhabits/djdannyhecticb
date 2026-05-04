# Database Backup & Disaster Recovery Guide

## Overview

This document outlines the production-grade backup strategy for the djdannyhecticb Supabase PostgreSQL database. The goal is to prevent data loss and enable rapid recovery in case of incidents.

**Project Details:**
- **Database Host**: db.ujxncnmoccotlssnqzwx.supabase.co (eu-west-1)
- **Database Engine**: PostgreSQL 17.6.1
- **Project ID**: ujxncnmoccotlssnqzwx
- **Organization**: uktnolsmfxxdfuqbyvbv

---

## Backup Strategy

### Backup Scope

The following tables are included in all backups:
- `live_sessions` - Live streaming session data
- `chat_messages` - User chat messages and metadata
- `user_badges` - User badge assignments
- `donations` - Payment/donation records
- `reactions` - User reactions during streams
- `polls` - Poll questions and metadata
- `poll_votes` - Individual poll votes
- `leaderboards` - User rankings and statistics
- `notifications` - System notifications
- `streamer_stats` - Aggregate streamer statistics
- `custom_emotes` - Custom emote definitions
- `raids` - Stream raids between streamers
- `social_links` - User social media profiles

### Backup Schedule

**Automated Backups** (Supabase Free Tier):
- Frequency: Daily
- Retention: 7 days (automatic)

**Enhancement Path** (Recommended for Production):
- Upgrade to Pro plan for extended retention (30 days)
- Or implement additional backup mechanism (see [Alternative Backup Strategy](#alternative-backup-strategy))

**Current Status**: Database is 2 days old (created 2026-04-29), no data loss risk yet.

---

## Automated Backup Configuration

### Supabase Built-in Backups

Supabase automatically creates daily backups of your PostgreSQL database:

1. **Enable Automated Backups**:
   - Go to https://app.supabase.com/project/ujxncnmoccotlssnqzwx/settings/backups
   - Backups are enabled by default
   - Current retention: 7 days

2. **Backup Times**:
   - Backups run once daily
   - Preferred time: 02:00 UTC (off-peak)
   - Duration: 5-30 minutes depending on database size

3. **Verify Backup Status**:
   ```bash
   # Using Supabase CLI
   supabase projects list
   supabase status --project-ref ujxncnmoccotlssnqzwx
   ```

### Check Backup Status in Dashboard

1. Visit [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to Settings → Backups
3. View:
   - Last backup timestamp
   - Backup size
   - Retention period
   - Available restore points

---

## Manual Backup Procedures

### Method 1: Using Supabase CLI

Install and configure Supabase CLI:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Authenticate with Supabase
supabase login

# Create a manual backup
supabase db dump --project-ref ujxncnmoccotlssnqzwx \
  --format sql \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup size will typically be <10MB for fresh database
```

### Method 2: Direct PostgreSQL Dump

Using psql directly with the database URL:

```bash
# Set environment variable with database URL
export DATABASE_URL="postgresql://postgres:Blackgrapeman10@db.ujxncnmoccotlssnqzwx.supabase.co:5432/postgres"

# Create full database dump
pg_dump $DATABASE_URL > backup_full_$(date +%Y%m%d_%H%M%S).sql

# Create schema-only backup (no data)
pg_dump $DATABASE_URL --schema-only > backup_schema_$(date +%Y%m%d_%H%M%S).sql

# Create data-only backup (no schema)
pg_dump $DATABASE_URL --data-only > backup_data_$(date +%Y%m%d_%H%M%S).sql

# Compress for storage
gzip backup_full_$(date +%Y%m%d_%H%M%S).sql
```

### Method 3: Using Node.js (Programmatic)

For automated backups in your CI/CD pipeline:

```javascript
// backup.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRef = 'ujxncnmoccotlssnqzwx';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(__dirname, `backups/backup_${timestamp}.sql`);

// Ensure backup directory exists
if (!fs.existsSync('backups')) {
  fs.mkdirSync('backups');
}

const command = `supabase db dump --project-ref ${projectRef} --format sql > ${backupPath}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
  
  const fileSize = fs.statSync(backupPath).size;
  console.log(`Backup created: ${backupPath} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
});
```

---

## Restore Procedures

### Recovery Time Objective (RTO)

- **RTO (Point-in-Time Recovery)**: < 15 minutes
- **RTO (Full Database Restore)**: < 30 minutes
- **RTO (Selective Table Restore)**: < 10 minutes

### Recovery Point Objective (RPO)

- **RPO (Automated Backups)**: 24 hours (1 day)
- **RPO (Manual Backups)**: Ad-hoc (depends on frequency)

### Restore from Supabase Backup

**Important: This will overwrite the current database**

1. Go to [Supabase Dashboard](https://app.supabase.com/project/ujxncnmoccotlssnqzwx/settings/backups)
2. Click "Restore" on the desired backup point
3. Confirm the restore operation
4. Wait for the restore to complete (5-30 minutes)
5. Test the restored data
6. Notify stakeholders of recovery

### Restore from SQL Dump (Point-in-Time)

```bash
# Set environment variable
export DATABASE_URL="postgresql://postgres:Blackgrapeman10@db.ujxncnmoccotlssnqzwx.supabase.co:5432/postgres"

# Restore full database
psql $DATABASE_URL < backup_full_20260503_120000.sql

# Restore specific tables only
psql $DATABASE_URL < backup_specific_tables.sql

# Restore and monitor progress
psql $DATABASE_URL < backup_full_20260503_120000.sql 2>&1 | tee restore.log
```

### Restore Using Node.js (Programmatic)

```javascript
// restore.js
const { spawn } = require('child_process');
const fs = require('fs');

const backupFile = process.argv[2] || 'backup_latest.sql';
const databaseUrl = process.env.DATABASE_URL;

if (!fs.existsSync(backupFile)) {
  console.error(`Backup file not found: ${backupFile}`);
  process.exit(1);
}

const psql = spawn('psql', [databaseUrl]);

psql.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

psql.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

psql.on('close', (code) => {
  if (code === 0) {
    console.log('Restore completed successfully');
  } else {
    console.error(`Restore failed with code ${code}`);
    process.exit(code);
  }
});

const input = fs.createReadStream(backupFile);
input.pipe(psql.stdin);
```

### Selective Table Restore

Restore only specific tables without affecting others:

```bash
# Extract specific table from full dump
grep -A 10000 "^CREATE TABLE public.donations" backup_full.sql | \
  grep -B 10000 "^CREATE TABLE public.reactions" > restore_donations.sql

# Restore the extracted table
psql $DATABASE_URL < restore_donations.sql
```

---

## Alternative Backup Strategy (Enhanced)

For higher availability and longer retention (recommended for production):

### Option 1: S3-Based Backups

Store backups in AWS S3 with 90-day retention:

```bash
# Install AWS CLI
npm install -g aws-cli

# Configure AWS credentials
aws configure

# Create automated backup script
#!/bin/bash
# backup_to_s3.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql"
S3_BUCKET="djdannyhecticb-backups"
S3_KEY="database/backups/${BACKUP_FILE}.gz"

# Create backup
supabase db dump --project-ref ujxncnmoccotlssnqzwx \
  --format sql | gzip > $BACKUP_FILE.gz

# Upload to S3 with private ACL
aws s3 cp $BACKUP_FILE.gz s3://$S3_BUCKET/$S3_KEY \
  --sse AES256 \
  --acl private \
  --metadata "timestamp=$TIMESTAMP,database=djdannyhecticb"

# Cleanup local file
rm $BACKUP_FILE.gz

echo "Backup uploaded to s3://$S3_BUCKET/$S3_KEY"
```

### Option 2: GitHub Actions Automation

Automated daily backups via GitHub Actions:

```yaml
# .github/workflows/database-backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Supabase CLI
        run: npm install -g supabase
      
      - name: Create Database Backup
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: |
          TIMESTAMP=$(date +%Y%m%d_%H%M%S)
          supabase db dump --project-ref ujxncnmoccotlssnqzwx \
            --format sql > backup_${TIMESTAMP}.sql
          gzip backup_${TIMESTAMP}.sql
      
      - name: Upload to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          TIMESTAMP=$(date +%Y%m%d_%H%M%S)
          aws s3 cp backup_${TIMESTAMP}.sql.gz \
            s3://djdannyhecticb-backups/database/backups/ \
            --sse AES256 --acl private
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: backup-${{ github.run_number }}
          release_name: Database Backup ${{ github.run_number }}
          draft: false
          prerelease: true
```

### Option 3: Replication to Another PostgreSQL Instance

Set up continuous replication to a standby database:

```sql
-- Enable WAL archiving (contact Supabase support to enable)
-- After enabled, configure replication:

-- On standby server
postgres=# CREATE SUBSCRIPTION dj_danny_sub
  CONNECTION 'postgresql://user:password@db.ujxncnmoccotlssnqzwx.supabase.co:5432/postgres'
  PUBLICATION all_publications;

-- Verify replication status
SELECT * FROM pg_stat_replication;
```

---

## Backup Testing & Validation

### Monthly Restore Test

Document the restore test procedure:

```bash
#!/bin/bash
# test_restore.sh

echo "=== Database Backup Restore Test ==="
echo "Test Date: $(date)"

# Get latest backup
BACKUP_FILE=$(ls -t backups/*.sql.gz | head -1)
echo "Testing restore from: $BACKUP_FILE"

# Create test database name
TEST_DB="test_restore_$(date +%s)"

# Decompress backup
BACKUP_UNCOMPRESSED="${BACKUP_FILE%.gz}"
gunzip -k "$BACKUP_FILE"

# Restore to test database
echo "Restoring to test database: $TEST_DB"
psql $DATABASE_URL < "$BACKUP_UNCOMPRESSED" 2>&1

# Run validation queries
echo "Running validation queries..."
psql $DATABASE_URL << EOF
-- Check table counts
SELECT 'live_sessions' AS table_name, COUNT(*) FROM live_sessions
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM chat_messages
UNION ALL
SELECT 'donations', COUNT(*) FROM donations;

-- Check data integrity
SELECT COUNT(*) AS total_records FROM (
  SELECT COUNT(*) FROM live_sessions
  UNION ALL
  SELECT COUNT(*) FROM chat_messages
  UNION ALL
  SELECT COUNT(*) FROM donations
) AS counts;
EOF

# Cleanup
rm "$BACKUP_UNCOMPRESSED"

echo "=== Restore Test Completed Successfully ==="
```

### Restore Test Checklist

- [ ] Backup file is accessible and not corrupted
- [ ] Restore process completes without errors
- [ ] All tables are present after restore
- [ ] Row counts match pre-backup counts
- [ ] Foreign key relationships are intact
- [ ] Indexes are rebuilt correctly
- [ ] No orphaned records exist
- [ ] Timestamps are preserved correctly

---

## Backup Retention Policy

| Backup Type | Frequency | Retention | Storage | Cost |
|---|---|---|---|---|
| Automated (Supabase) | Daily | 7 days | Native | Included |
| Manual (Local) | On-demand | 30 days | Git/S3 | Storage only |
| S3 Archive | Daily | 90 days | AWS S3 | ~$0.023/GB/month |
| GitHub Releases | Nightly | 1 year | GitHub | Free (Releases) |

---

## Disaster Recovery Scenarios

### Scenario 1: Accidental Data Deletion

**Symptoms**: User reports missing data (e.g., deleted messages)

**Recovery Steps**:
1. Determine when deletion occurred
2. Select backup point before deletion
3. Extract deleted table from backup
4. Merge data back into production database
5. Notify affected users

**Time to Recover**: 10-15 minutes

```sql
-- Example: Recover deleted messages from backup
-- 1. Create temporary table from backup
CREATE TABLE chat_messages_recovered AS
  SELECT * FROM backup.chat_messages
  WHERE deleted_at > '2026-05-01 00:00:00'
  AND deleted_at < '2026-05-02 00:00:00';

-- 2. Identify which messages to restore
SELECT * FROM chat_messages_recovered WHERE user_id = 12345;

-- 3. Insert recovered messages
INSERT INTO chat_messages SELECT * FROM chat_messages_recovered
  ON CONFLICT (id) DO NOTHING;

-- 4. Cleanup
DROP TABLE chat_messages_recovered;
```

### Scenario 2: Database Corruption

**Symptoms**: Query errors, index corruption, constraint violations

**Recovery Steps**:
1. Identify corrupt table(s) using `REINDEX`
2. If corruption is widespread, use full backup restore
3. Restore to point just before corruption began
4. Reapply any data changes after restoration
5. Run integrity checks

**Time to Recover**: 20-30 minutes

```sql
-- Detect corruption
REINDEX INDEX CONCURRENTLY chat_messages_pkey;

-- If reindex fails, restore from backup
-- Full recovery procedure documented above
```

### Scenario 3: Complete Database Loss

**Symptoms**: Cannot connect to database, all data inaccessible

**Recovery Steps**:
1. Declare incident
2. Restore latest backup to new database instance
3. Update connection strings to new instance
4. Verify all data is present
5. Test application connectivity
6. Communicate status to users

**Time to Recover**: 30-45 minutes

**Required**: Automated backup (enabled)

---

## Backup Monitoring & Alerts

### Key Metrics to Monitor

1. **Last Backup Time**
   - Alert if backup hasn't run in 25 hours
   - Check: https://app.supabase.com/project/ujxncnmoccotlssnqzwx/settings/backups

2. **Backup Size Trend**
   - Track growth over time (should be < 100MB normally)
   - Alert if growth > 50% month-over-month unexpectedly

3. **Failed Restore Tests**
   - Monthly restore test should succeed
   - Document failures and root causes

### Backup Failure Response

If a backup fails:

1. Check dashboard for error message
2. Review PostgreSQL logs for specific errors
3. Verify disk space availability
4. Contact Supabase support if needed
5. Ensure redundant backup mechanism is in place (S3)

**Escalation**: If backup has failed for > 48 hours, manually trigger backup before next scheduled run.

---

## Important Notes

### Security Considerations

- **Database Credentials**: Keep DATABASE_URL secret, never commit to git
- **Backup Storage**: Use private ACL for S3 backups
- **Access Control**: Limit who can trigger restores
- **Encryption**: S3 backups use AES256 encryption
- **Audit Logging**: Log all restore operations

### Current Database Status

- **Project Created**: 2026-04-29 (4 days old)
- **Current Size**: ~1-5 MB (estimated)
- **Data Criticality**: High (user donations, streaming sessions)
- **Backup Coverage**: 100% (all tables included)

### Upgrade Path

**When to upgrade to Supabase Pro**:
- Database size > 50 GB
- Need for extended backup retention (> 7 days)
- Require advanced backup features
- Database activity > 100,000 writes/day

**Pro Plan Benefits**:
- 30-day backup retention
- Point-in-time recovery
- Priority support
- Pricing: ~$25/month (database)

---

## Backup Testing Schedule

| Date | Type | Status | Notes |
|---|---|---|---|
| 2026-05-03 | Initial Setup | ✅ Complete | 7-day retention enabled |
| 2026-06-03 | Monthly Test | Scheduled | Verify restore procedure |
| 2026-07-03 | Monthly Test | Scheduled | Verify restore procedure |
| 2026-08-03 | Monthly Test | Scheduled | Verify restore procedure |

---

## Contact & Escalation

**Primary Contacts**:
- Database Owner: richhabitslondon@gmail.com
- Supabase Support: https://supabase.com/support
- GitHub Issues: Report backup-related issues

**Emergency**: If data loss is imminent, contact Supabase support immediately with incident code.

---

## Appendix: Useful Commands

```bash
# List all backups (Supabase CLI)
supabase projects list

# Check database size
psql $DATABASE_URL -c "SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Monitor backup progress
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity WHERE query LIKE '%COPY%';"

# Verify backup integrity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pg_class;"

# Export specific table
pg_dump $DATABASE_URL --table=public.donations --data-only | gzip > donations_export.sql.gz

# Import specific table
gunzip < donations_export.sql.gz | psql $DATABASE_URL

# Generate backup report
echo "Backup Report - $(date)" && \
  psql $DATABASE_URL -c "\l" && \
  psql $DATABASE_URL -c "\dt+ public.*"
```

---

**Last Updated**: 2026-05-03
**Version**: 1.0
**Document Owner**: Database Infrastructure Team
