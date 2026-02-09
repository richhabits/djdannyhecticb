# ZeroOps Automation Framework
# Hectic Empire Server Automation

This directory contains the automation framework for self-healing, event-driven operations.

## Philosophy

**AI as Operator, not as a daemon.**

- AI is invoked only when triggers fire (not running 24/7)
- Rules handle 90% of decisions (restart, cleanup, rollback)
- AI provides root cause analysis and incident reports
- Hard gates prevent automation from bricking production

## Scripts

### `proof-pack-predeploy.sh`
Enterprise deployment gate that verifies:
- HTTPS/HSTS headers on all subdomains
- Cookie security attributes
- Rate limiter wiring
- TypeScript compilation
- Docker container health
- SSL certificate expiry

**Usage:**
```bash
./scripts/proof-pack-predeploy.sh
```

Reports saved to `proofpacks/` directory.

### `ops-agent.sh`
Event-driven AI operator that:
1. Collects system snapshots (disk, memory, containers, nginx)
2. Detects triggers (disk pressure, unhealthy containers, 5xx spikes)
3. Calls local LLM (Ollama) for root cause analysis
4. Proposes safe remediation commands

**Usage:**
```bash
# Full analysis
./scripts/ops-agent.sh run

# Just collect system state
./scripts/ops-agent.sh snapshot

# Just check for issues
./scripts/ops-agent.sh triggers
```

**Requirements:**
- Ollama running locally with `qwen2.5:7b-instruct` model
- Install Ollama: `curl -fsSL https://ollama.com/install.sh | sh`
- Pull model: `ollama pull qwen2.5:7b-instruct`

## Deployment Gates

| Gate | Description | Enforcement |
|------|-------------|-------------|
| PRECHECK_GATE | SSL/HSTS/subdomains/env validation | proof-pack-predeploy.sh |
| SMOKE_GATE | Health endpoints + minimal flows | /api/health |
| ROLLBACK_READY | Last known good artifact exists | Docker tags |
| DIFF_BOUNDARY | No cross-project bleed | Git branch protection |

## Triggers → Actions Matrix

| Trigger | Detection | Automated Action |
|---------|-----------|------------------|
| Nginx 5xx spike | Log grep | Alert + restart consideration |
| API health fail | /api/health | Container restart |
| Container crash-loop | Docker status | Rollback to previous tag |
| Disk > 80% | df | docker system prune |
| TLS cert < 14 days | openssl check | Certbot renewal + alert |
| Memory pressure | free/OOM | Container restart |
| GitHub push to main | Webhook | Run proof-pack + deploy |

## Rate Limit Tiers

| Tier | Window | Max Requests | Use Case |
|------|--------|--------------|----------|
| PUBLIC | 1 min | 100 | General API |
| AUTH | 15 min | 10 | Login/register |
| BOOKING | 1 hour | 5 | Lead generation |
| AI | 1 min | 20 | Chat/assistant |
| STRICT | 10 sec | 300 | DDoS protection |
| **INTEL** | 1 min | 60 | Rave intel alerts |

## Systemd Integration (Server)

For production servers, create `/etc/systemd/system/hectic-ops.timer`:

```ini
[Unit]
Description=Hectic Ops Agent Timer

[Timer]
OnCalendar=*:0/15
Persistent=true

[Install]
WantedBy=timers.target
```

And `/etc/systemd/system/hectic-ops.service`:

```ini
[Unit]
Description=Hectic Ops Agent

[Service]
Type=oneshot
WorkingDirectory=/var/www/djdannyhecticb
ExecStart=/var/www/djdannyhecticb/scripts/ops-agent.sh run
User=www-data
```

Enable with:
```bash
sudo systemctl enable hectic-ops.timer
sudo systemctl start hectic-ops.timer
```

## Cron Alternative

If systemd timers aren't available:

```cron
# Run ops agent every 15 minutes
*/15 * * * * /path/to/repo/scripts/ops-agent.sh run >> /var/log/hectic-ops.log 2>&1

# Run proof pack before weekly maintenance
0 2 * * 0 /path/to/repo/scripts/proof-pack-predeploy.sh >> /var/log/hectic-proofpack.log 2>&1
```

## Local LLM Setup

For AI-powered analysis without cloud costs:

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a small, fast model
ollama pull qwen2.5:7b-instruct  # ~4GB, good balance
# OR for smaller servers:
ollama pull phi3:mini  # ~2GB, faster but less capable

# Test
ollama run qwen2.5:7b-instruct "Hello, are you working?"

# Run as service
sudo systemctl enable ollama
sudo systemctl start ollama
```

The ops-agent will automatically detect and use Ollama when available.
