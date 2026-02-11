# Cron Examples for Zero-Touch Automation

## Server Maintenance (Nightly)

Run maintenance script every night at 2 AM:

```bash
0 2 * * * /var/www/djdannyhecticb/scripts/maintenance.sh >> /var/log/maintenance.log 2>&1
```

## Alternative Schedules

### Run every 6 hours
```bash
0 */6 * * * /var/www/djdannyhecticb/scripts/maintenance.sh >> /var/log/maintenance.log 2>&1
```

### Run weekly (Sunday at 3 AM)
```bash
0 3 * * 0 /var/www/djdannyhecticb/scripts/maintenance.sh >> /var/log/maintenance.log 2>&1
```

### Run monthly (1st day at 4 AM)
```bash
0 4 1 * * /var/www/djdannyhecticb/scripts/maintenance.sh >> /var/log/maintenance.log 2>&1
```

## Setup Instructions

```bash
# Edit crontab for deploy user
sudo -u deploy crontab -e

# Add your chosen schedule
# Save and exit

# Verify crontab
sudo -u deploy crontab -l

# Check logs
tail -f /var/log/maintenance.log
```

## Logrotate (Alternative to Script)

If you prefer using logrotate instead of script-based rotation:

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/djdannyhecticb

# Add:
/var/log/djdannyhecticb/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    missingok
    create 0644 deploy deploy
}

# Test
sudo logrotate -f /etc/logrotate.d/djdannyhecticb
```

## Monitoring Cron

### Check if cron is running
```bash
systemctl status cron
```

### View cron logs
```bash
grep CRON /var/log/syslog
```

### Test maintenance script manually
```bash
sudo -u deploy /var/www/djdannyhecticb/scripts/maintenance.sh
```
