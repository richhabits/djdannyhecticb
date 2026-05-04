# Database Backup Quick Reference

**For complete documentation, see**: [docs/DATABASE_BACKUPS.md](./docs/DATABASE_BACKUPS.md)

---

## At-a-Glance Status

| Item | Status |
|------|--------|
| **Automated Backups** | ✅ Enabled (daily) |
| **Retention Period** | 7 days |
| **Last Backup** | Automated (check dashboard) |
| **Backup Location** | Supabase + GitHub Artifacts |
| **Database Size** | ~5 MB |
| **RTO (Recovery Time)** | 30 minutes (full) / 15 minutes (PITR) |
| **RPO (Recovery Point)** | 24 hours |

---

## Quick Commands

### Create a Manual Backup

```bash
# Using Supabase CLI
export DATABASE_URL="postgresql://postgres:Blackgrapeman10@db.ujxncnmoccotlssnqzwx.supabase.co:5432/postgres"

pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
gzip backup_*.sql
```

### Run Backup Test

```bash
# Full test (create + validate)
./scripts/backup-test.sh --full

# Just validate latest backup
./scripts/backup-test.sh --validate

# Generate report
./scripts/backup-test.sh --report
```

### Restore from Backup (DESTRUCTIVE!)

```bash
# Via Supabase Dashboard (recommended)
# 1. Go to https://app.supabase.com/project/ujxncnmoccotlssnqzwx/settings/backups
# 2. Click "Restore" on desired backup
# 3. Confirm

# Via command line
psql $DATABASE_URL < backup_20260503_120000.sql
```

### Check Database Status

```bash
# Size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Tables
psql $DATABASE_URL -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"

# Recent changes
psql $DATABASE_URL -c "SELECT * FROM live_sessions ORDER BY created_at DESC LIMIT 5;"
```

---

## Common Scenarios

### Scenario: User reports deleted data

1. **Determine when** it was deleted
2. **Go to** Supabase dashboard → Settings → Backups
3. **Select** backup from BEFORE deletion occurred
4. **Click** "Restore" and confirm
5. **Verify** data is restored
6. **Notify** user

**Time**: 10-15 minutes

### Scenario: Database appears corrupted

1. **Check** Supabase status dashboard
2. **Try** running a simple query: `SELECT 1;`
3. If failed:
   - Restore from latest backup
   - Contact Supabase support
4. If succeeded:
   - Run REINDEX: `REINDEX DATABASE postgres;`
   - Monitor for errors

**Time**: 20-30 minutes

### Scenario: Scheduled backup failed to run

1. **Check** GitHub Actions workflow: https://github.com/romeovalentine/djdannyhecticb/actions
2. **Review** error logs
3. **Manually trigger** workflow:
   - Go to Actions
   - Select "Database Backup & Monitoring"
   - Click "Run workflow"
4. **Monitor** until completion
5. **Create issue** if persistent

**Time**: 5-10 minutes

---

## Backup Workflow Files

| File | Purpose |
|------|---------|
| `.github/workflows/database-backup.yml` | Daily automated backups |
| `.github/workflows/backup-monitoring.yml` | Health checks & alerts |
| `scripts/backup-test.sh` | Manual backup testing |
| `config/backup-config.json` | Backup configuration |
| `docs/DATABASE_BACKUPS.md` | Complete documentation |

---

## Key Contacts

- **Database Owner**: richhabitslondon@gmail.com
- **Supabase Support**: https://supabase.com/support
- **GitHub Issues**: See [BACKUP issues](https://github.com/romeovalentine/djdannyhecticb/issues?q=label%3Abackup)

---

## Environment Variables Needed

```bash
# Required for manual backups
export DATABASE_URL="postgresql://postgres:Blackgrapeman10@db.ujxncnmoccotlssnqzwx.supabase.co:5432/postgres"

# Optional for AWS S3 uploads
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_S3_BUCKET_NAME="djdannyhecticb-backups"
```

---

## Critical Information

**Project Details**:
- Project ID: `ujxncnmoccotlssnqzwx`
- Region: `eu-west-1`
- Engine: PostgreSQL 17.6.1
- Host: `db.ujxncnmoccotlssnqzwx.supabase.co`

**Tables Backed Up** (13 total):
- live_sessions, chat_messages, donations, streamer_stats
- notifications, reactions, polls, poll_votes
- leaderboards, user_badges, custom_emotes, raids
- social_links

**Backup Retention**:
- Automated: 7 days (Supabase)
- Artifacts: 7 days (GitHub)
- S3 (if enabled): 90 days

---

## Troubleshooting

### Problem: Backup file corrupted

```bash
# Verify gzip integrity
gzip -t backup_file.sql.gz

# If corrupted, recreate
./scripts/backup-test.sh --full
```

### Problem: Can't connect to database

```bash
# Check connection string
echo $DATABASE_URL

# Test manually
psql $DATABASE_URL -c "SELECT 1;"

# Check Supabase dashboard for status
```

### Problem: Restore is slow

- Normal for databases > 100MB
- Monitor progress in logs
- Don't interrupt (may cause corruption)
- Allow 30+ minutes for large restores

---

## Monthly Checklist

- [ ] Verify automated backup ran
- [ ] Check backup file size is reasonable
- [ ] Run restore test: `./scripts/backup-test.sh --full`
- [ ] Review GitHub Actions workflow logs
- [ ] Check for any backup-related issues
- [ ] Update this file if procedures changed
- [ ] Verify S3 backups (if configured)

---

## Emergency Contacts

**If you cannot recover data**:

1. Contact Supabase Support: https://supabase.com/support
2. Provide error logs and backup file details
3. Incident code: `DATABASE_BACKUP_ISSUE`
4. Severity: CRITICAL

---

**Last Updated**: 2026-05-03
**Next Review**: 2026-06-03
**Version**: 1.0
