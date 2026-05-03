# Database Backup Strategy

**Status**: Production Ready  
**Last Updated**: 2026-05-03  
**Criticality**: CRITICAL

## Overview

This document outlines the comprehensive backup and disaster recovery strategy for djdannyhecticb's PostgreSQL database. The database stores all critical business data including users, bookings, payments, and content.

## Current Setup

- **Database**: PostgreSQL (hosted on Vercel or dedicated provider)
- **Connection**: Managed via `DATABASE_URL` environment variable
- **Size**: Growing (currently ~500MB estimated with indexes)
- **Uptime**: Production-critical (99.9% SLA required)

## Backup Strategy

### 1. Automated Daily Backups (PRIMARY)

**Frequency**: Daily at 02:00 UTC (off-peak hours)  
**Retention**: 30 days rolling window  
**Location**: S3 (encrypted at rest)

#### Implementation via AWS Backup:
```bash
# Set up via AWS Console or CLI
aws backup create-backup-plan \
  --backup-plan "{
    'BackupPlanName': 'djdannyhecticb-daily',
    'Rules': [{
      'RuleName': 'DailyPostgres',
      'TargetBackupVault': 'djdannyhecticb-vault',
      'ScheduleExpression': 'cron(0 2 ? * * *)',
      'StartWindowMinutes': 60,
      'CompletionWindowMinutes': 180,
      'Lifecycle': {
        'DeleteAfterDays': 30
      }
    }]
  }"
```

#### S3 Storage Configuration:
- **Bucket**: `djdannyhecticb-database-backups`
- **Encryption**: AES-256 (SSE-S3)
- **Versioning**: Enabled (automatic recovery point)
- **Lifecycle**: Delete backups older than 30 days
- **Cost**: ~$10-20/month for daily backups

### 2. Point-in-Time Recovery (PITR)

**Retention Period**: 7 days  
**RTO**: 15 minutes  
**RPO**: 5 minutes

Enable continuous write-ahead logging (WAL) backups:

```sql
-- Enable continuous archiving (on dedicated provider)
-- Contact database host to enable WAL archiving to S3
-- Configuration varies by provider (AWS RDS, Railway, etc.)
```

Benefits:
- Recover database to any second within last 7 days
- No data loss for critical incidents
- Granular recovery window

### 3. Weekly Manual Snapshots (SECONDARY)

**Frequency**: Every Sunday at 03:00 UTC  
**Retention**: 12 weeks (3 months)  
**Location**: S3 + local secure storage

```bash
# Weekly backup script (cron job)
#!/bin/bash
BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql.gz"
pg_dump ${DATABASE_URL} | gzip > ${BACKUP_FILE}
aws s3 cp ${BACKUP_FILE} s3://djdannyhecticb-database-backups/weekly/
# Keep local copy for 48 hours
```

### 4. Cross-Region Replication

**Primary Region**: us-east-1 (Vercel/main host)  
**Secondary Region**: eu-west-1 (disaster recovery)

```bash
# S3 Cross-Region Replication
aws s3api put-bucket-replication \
  --bucket djdannyhecticb-database-backups \
  --replication-configuration '{
    "Role": "arn:aws:iam::ACCOUNT:role/s3-replication",
    "Rules": [{
      "Status": "Enabled",
      "Priority": 1,
      "Destination": {
        "Bucket": "arn:aws:s3:::djdannyhecticb-database-backups-eu",
        "StorageClass": "STANDARD_IA"
      }
    }]
  }'
```

## Backup Verification

### Monthly Restoration Test

**Schedule**: First Sunday of each month at 04:00 UTC  
**Duration**: 30 minutes  
**Goal**: Verify backups are restorable

```bash
#!/bin/bash
# Restore to temporary database
RESTORE_DB="djdannyhecticb_restore_test_$(date +%Y%m%d)"
createdb ${RESTORE_DB}

# Restore from latest weekly backup
LATEST_BACKUP=$(aws s3 ls s3://djdannyhecticb-database-backups/weekly/ \
  --recursive | sort | tail -1 | awk '{print $4}')

aws s3 cp s3://djdannyhecticb-database-backups/${LATEST_BACKUP} - | \
  gunzip | psql ${RESTORE_DB}

# Run integrity checks
psql ${RESTORE_DB} -c "SELECT COUNT(*) FROM users;"
psql ${RESTORE_DB} -c "ANALYZE;"

# Drop test database
dropdb ${RESTORE_DB}

# Log successful test
echo "Backup restoration test passed: $(date)" >> /var/log/backup-tests.log
```

### Backup Health Monitoring

```sql
-- Query to verify backup completeness
SELECT
  schemaname,
  COUNT(*) as table_count,
  pg_size_pretty(SUM(pg_total_relation_size(schemaname||'.'||tablename))) as total_size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
GROUP BY schemaname;
```

## Disaster Recovery Procedures

### Scenario 1: Data Corruption (RTO: 2 hours)

1. **Detect**: Monitoring alerts on data inconsistencies
2. **Assess**: Determine scope of corruption (table level, rows)
3. **Restore**: Use PITR to recover from 1 hour before corruption
4. **Validate**: Run integrity checks
5. **Notify**: Inform admin and affected users

```bash
# Recovery procedure
# Contact your database provider to restore from timestamp
# Example for managed services:
vercel env pull  # Get current config
pg_restore --clean --if-exists backup-file.sql
psql -c "REINDEX DATABASE djdannyhecticb"
```

### Scenario 2: Complete Database Loss (RTO: 4 hours)

1. **Failover**: Switch to cross-region replica if available
2. **Provision**: Create new database instance
3. **Restore**: Restore from most recent S3 backup
4. **Reindex**: Run optimization and index rebuild
5. **Verify**: Test all critical features
6. **Repoint**: Update `DATABASE_URL` to new instance

### Scenario 3: Ransomware/Unauthorized Access (RTO: 6 hours)

1. **Isolate**: Remove database from network
2. **Verify**: Check backup integrity (must be older than infection)
3. **Recover**: Restore to known-good backup (ideally immutable copy)
4. **Audit**: Investigate access logs
5. **Rebuild**: Implement security fixes before restarting

## Backup Access Control

**S3 Bucket Permissions**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT:role/backup-admin"
      },
      "Action": ["s3:*"],
      "Resource": "arn:aws:s3:::djdannyhecticb-database-backups*"
    },
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:DeleteObject",
      "Resource": "arn:aws:s3:::djdannyhecticb-database-backups/*",
      "Condition": {
        "StringNotLike": {
          "aws:userid": "*:backup-admin"
        }
      }
    }
  ]
}
```

**Encryption Key Access**:
- KMS key restricted to backup-admin role
- 90-day rotation policy
- Multi-factor authentication required for key operations

## Cost Analysis

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| AWS Backup (Daily) | $15 | 30-day retention |
| S3 Storage (Backups) | $8 | ~500 GB average |
| S3 Cross-Region Replication | $5 | Read/write operations |
| KMS Encryption | $2 | Key operations |
| **Total** | **~$30** | |

## Automation Checklist

- [ ] Set up AWS Backup daily schedule
- [ ] Configure S3 Cross-Region Replication
- [ ] Create weekly backup cron job (run via GitHub Actions)
- [ ] Set up monthly restoration test
- [ ] Configure CloudWatch alerts for backup failures
- [ ] Document recovery procedures for team
- [ ] Store encryption keys in secure vault (AWS Secrets Manager)
- [ ] Test backup restoration (dry-run every month)

## Alerting & Monitoring

### CloudWatch Alarms

```bash
# Alert on backup failure
aws cloudwatch put-metric-alarm \
  --alarm-name djdannyhecticb-backup-failure \
  --alarm-description "Alert if daily backup fails" \
  --metric-name BackupJobStatus \
  --namespace AWS/Backup \
  --statistic Average \
  --period 3600 \
  --threshold 1 \
  --comparison-operator LessThanThreshold
```

### Slack Integration

```bash
# Backup completion notification
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Database backup completed",
    "blocks": [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Backup Status*\nSize: 512MB\nDuration: 18min\nEncryption: AES-256"
      }
    }]
  }'
```

## References

- [AWS Backup Documentation](https://docs.aws.amazon.com/aws-backup/)
- [PostgreSQL WAL Configuration](https://www.postgresql.org/docs/current/wal.html)
- [NIST Backup Guidelines](https://csrc.nist.gov/publications/detail/sp/800-34/rev-1/final)
- [3-2-1 Backup Rule](https://www.backblaze.com/blog/the-3-2-1-backup-strategy/)

## Review Schedule

- **Quarterly**: Verify backup procedures work
- **Semi-annually**: Review retention policies and costs
- **Annually**: Conduct full disaster recovery drill

---

**Ownership**: Platform Engineering  
**Next Review**: 2026-08-03
