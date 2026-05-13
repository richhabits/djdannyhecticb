# Scripts Directory

Automation and utility scripts for Hectic Radio development, testing, and deployment.

## Railway Deployment

### setup-railway.sh

Comprehensive Railway setup automation for production deployment with minimal user interaction.

**Features:**
- Automatic Railway CLI installation
- User authentication (railway login)
- Project linking
- Interactive environment variable configuration
- Railway token generation for GitHub Actions
- Domain capture for deployment
- Optional immediate deployment

**Usage:**
```bash
./scripts/setup-railway.sh
```

**Prerequisites:**
- Node.js and npm installed
- Railway account created
- Access to Supabase credentials
- GitHub account for secrets configuration

**What it does:**
1. Checks for Railway CLI, installs if missing
2. Logs you into Railway
3. Links to your Railway project
4. Prompts for 10 key environment variables:
   - Supabase URL and keys
   - Turnstile security keys
   - Resend API and email configuration
   - Upstash Redis credentials
   - GTM ID for analytics
5. Sets all variables in Railway
6. Generates Railway token for GitHub Actions
7. Captures deployment domain
8. Optionally deploys immediately

**After setup:**
- Add `RAILWAY_TOKEN` and `RAILWAY_DOMAIN` to GitHub Secrets
- Monitor deployment with `railway logs`
- View live deployment with `railway open`

---

## Database Utilities

### verify-rls.sql

SQL script to verify Row Level Security (RLS) policies on Supabase tables.

**Usage:**
```bash
# In Supabase SQL Editor or via psql:
psql -h [HOST] -U postgres -d [DATABASE] -f scripts/verify-rls.sql
```

**What it checks:**
- Lists all public schema tables
- Counts RLS policies per table
- Expected output: ~5 policies per table for secured tables

**Example output:**
```
 table_name  | policy_count
-------------+--------------
 orders      |            5
 products    |            5
 profiles    |            5
```

---

## Other Available Scripts

- **ops-agent.sh** — Operations automation and environment management
- **proof-pack-predeploy.sh** — Pre-deployment validation and checks
- **backup-test.sh** — Database backup verification
- **smoke-test.sh** — Quick smoke tests
- **performance-queries.sql** — Performance diagnostics

## Directory Structure

```
scripts/
├── actions/                      # GitHub Actions workflows
├── setup-railway.sh             # Railway deployment setup (NEW)
├── verify-rls.sql               # RLS policy verification (NEW)
├── ops-agent.sh                 # Operations automation
├── proof-pack-predeploy.sh       # Pre-deployment checks
├── backup-test.sh               # Backup testing
├── smoke-test.sh                # Smoke tests
├── validate-performance-setup.ts # Performance validation
└── README.md                     # This file
```

## Quick Start

1. **Set up Railway for production:**
   ```bash
   chmod +x scripts/setup-railway.sh
   ./scripts/setup-railway.sh
   ```

2. **Verify RLS policies:**
   ```bash
   # Use Supabase SQL Editor or:
   cat scripts/verify-rls.sql | psql [your-connection-string]
   ```

3. **Run smoke tests:**
   ```bash
   ./scripts/smoke-test.sh
   ```

## Notes

- All `.sh` scripts must be executable: `chmod +x scripts/script-name.sh`
- SQL scripts can be run via Supabase SQL Editor or psql CLI
- TypeScript scripts require Node.js runtime
- Environment variables should be set before running deployment scripts
