# PM2 Deployment Guide for DJ Danny Hectic B

This guide covers deployment using PM2 (Node.js process manager) instead of Docker. This is the recommended approach for VPS/dedicated server deployments.

## 🎯 Overview

The DJ Danny Hectic B site is a full-stack application:
- **Frontend**: React + Vite (built to static files)
- **Backend**: Express + tRPC (Node.js server)
- **Deployment**: PM2 process manager + nginx reverse proxy

---

## 📋 Prerequisites

### On Your Local Machine (Mac)
- ✅ Node.js 18+ installed
- ✅ pnpm package manager (`npm install -g pnpm`)
- ✅ Git repository cloned
- ✅ SSH access to server

### On Your Server (213.199.45.126)
- ✅ Ubuntu/Debian Linux
- ✅ Node.js 18+ installed
- ✅ PM2 installed globally (`npm install -g pm2`)
- ✅ nginx installed
- ✅ MySQL database running
- ✅ Domain DNS pointing to server IP

---

## 🔧 Server Setup (One-Time)

SSH into your server and run these commands:

```bash
# Install Node.js 20 (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install nginx (if not installed)
sudo apt-get install -y nginx

# Create application directory
sudo mkdir -p /srv/djdannyhecticb
sudo chown $USER:$USER /srv/djdannyhecticb

# Create environment file
nano /srv/djdannyhecticb/.env
```

### Required Environment Variables

Add these to `/srv/djdannyhecticb/.env`:

```bash
# Server Configuration
NODE_ENV=production
PORT=3005
HOST=127.0.0.1

# Database
DATABASE_URL=mysql://user:password@localhost:3306/djdannyhecticb

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-super-secret-session-key-change-this

# API Keys (if using)
GEMINI_API_KEY=your-gemini-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# AWS S3 (if using)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# Ticketmaster API (if using)
TICKETMASTER_API_KEY=your-ticketmaster-key
```

---

## 🏗️ Build Process (Local Machine)

### Step 1: Navigate to Project Directory

```bash
cd /Users/romeovalentine/Downloads/djdannyhecticb-main
```

### Step 2: Install Dependencies

Since you have Stripe peer dependency issues, use this command:

```bash
pnpm install
```

If pnpm is not installed:

```bash
npm install -g pnpm
pnpm install
```

The package.json now has the correct Stripe versions that match peer dependencies.

### Step 3: Build the Application

```bash
pnpm build
```

This command does two things:
1. Builds the React frontend → `dist/public/`
2. Bundles the Node.js backend → `dist/index.mjs`

### Step 4: Verify Build Output

```bash
ls -la dist/
```

You should see:
```
dist/
├── index.mjs          # Backend server bundle
└── public/            # Frontend static files
    ├── index.html
    ├── assets/
    └── ...
```

✅ **If you see these files, the build succeeded!**

---

## 🚀 Deployment Process

### Method 1: Using rsync (Recommended)

From your local machine:

```bash
# Deploy backend server
rsync -avz --delete dist/index.mjs hectic@213.199.45.126:/srv/djdannyhecticb/

# Deploy frontend files
rsync -avz --delete dist/public/ hectic@213.199.45.126:/srv/djdannyhecticb/public/

# Deploy node_modules (first time only, or after package changes)
rsync -avz --delete node_modules/ hectic@213.199.45.126:/srv/djdannyhecticb/node_modules/
```

### Method 2: Using SCP

```bash
# Deploy all at once
scp -r dist/* hectic@213.199.45.126:/srv/djdannyhecticb/
```

---

## ⚙️ PM2 Configuration

### Start the Application

SSH into your server:

```bash
ssh hectic@213.199.45.126
cd /srv/djdannyhecticb

# Start with PM2
pm2 start dist/index.mjs --name djdannyhecticb

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs
```

### Verify Application is Running

```bash
# Check PM2 status
pm2 ls

# View logs
pm2 logs djdannyhecticb

# View real-time logs
pm2 logs djdannyhecticb --lines 50

# Monitor resources
pm2 monit
```

You should see:
```
┌─────┬────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name               │ status  │ ↺       │ cpu      │
├─────┼────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ djdannyhecticb     │ online  │ 0       │ 0%       │
└─────┴────────────────────┴─────────┴─────────┴──────────┘
```

### Useful PM2 Commands

```bash
# Restart application
pm2 restart djdannyhecticb

# Stop application
pm2 stop djdannyhecticb

# Delete from PM2
pm2 delete djdannyhecticb

# View detailed info
pm2 show djdannyhecticb

# Clear logs
pm2 flush djdannyhecticb
```

---

## 🌐 nginx Configuration

### Create nginx Configuration File

```bash
sudo nano /etc/nginx/sites-available/djdannyhecticb.com
```

Add this configuration:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name djdannyhecticb.com www.djdannyhecticb.com;
    
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name djdannyhecticb.com www.djdannyhecticb.com;

    # SSL Certificate paths (adjust if needed)
    ssl_certificate /etc/letsencrypt/live/djdannyhecticb.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/djdannyhecticb.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js application
    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache bypass
        proxy_cache_bypass $http_upgrade;
    }

    # Static file caching (optional optimization)
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
        proxy_pass http://127.0.0.1:3005;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/djdannyhecticb.com /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Setup SSL Certificate (if not already done)

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d djdannyhecticb.com -d www.djdannyhecticb.com

# Test renewal
sudo certbot renew --dry-run
```

---

## 🔄 Update Deployment Script

Create a deployment script for easy updates:

```bash
nano ~/deploy-djdannyhecticb.sh
```

Add this content:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying DJ Danny Hectic B..."

# Configuration
LOCAL_DIR="/Users/romeovalentine/Downloads/djdannyhecticb-main"
REMOTE_USER="hectic"
REMOTE_HOST="213.199.45.126"
REMOTE_DIR="/srv/djdannyhecticb"

# Build locally
echo "📦 Building application..."
cd "$LOCAL_DIR"
pnpm build

# Deploy files
echo "📤 Uploading files to server..."
rsync -avz --delete dist/index.mjs ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/
rsync -avz --delete dist/public/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/public/

# Restart application
echo "🔄 Restarting application..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && pm2 restart djdannyhecticb"

echo "✅ Deployment complete!"
echo "🌐 Visit: https://djdannyhecticb.com"
```

Make it executable:

```bash
chmod +x ~/deploy-djdannyhecticb.sh
```

Now you can deploy with:

```bash
~/deploy-djdannyhecticb.sh
```

---

## 🐛 Troubleshooting

### Issue: Build Fails with "Use pnpm only"

The package.json has a preinstall hook that enforces pnpm. Solutions:

1. **Install pnpm** (recommended):
   ```bash
   npm install -g pnpm
   pnpm install
   ```

2. **Use npm with flag** (not recommended):
   ```bash
   npm install --ignore-scripts
   npm run build
   ```

### Issue: Stripe Peer Dependency Error

The package.json has been updated to use `@stripe/stripe-js@^8.14.0` which satisfies the peer dependency requirement. Just run:

```bash
pnpm install
```

### Issue: PM2 Shows "errored" Status

Check logs:
```bash
pm2 logs djdannyhecticb --lines 100
```

Common causes:
- Missing environment variables in `/srv/djdannyhecticb/.env`
- Database connection issues
- Port 3005 already in use
- Missing node_modules

### Issue: nginx Shows 502 Bad Gateway

This means nginx can't connect to your Node.js app.

Check if app is running:
```bash
pm2 ls
curl http://127.0.0.1:3005
```

If not running, check PM2 logs:
```bash
pm2 logs djdannyhecticb
```

### Issue: SSL Certificate Errors

Re-generate certificates:
```bash
sudo certbot --nginx -d djdannyhecticb.com -d www.djdannyhecticb.com --force-renewal
```

### Issue: Application Crashes on Start

Check environment variables:
```bash
cat /srv/djdannyhecticb/.env
```

Ensure DATABASE_URL is correct:
```bash
# Test database connection
mysql -h localhost -u your_user -p your_database
```

---

## 📊 Monitoring

### View Application Logs

```bash
# Real-time logs
pm2 logs djdannyhecticb

# Last 100 lines
pm2 logs djdannyhecticb --lines 100

# Error logs only
pm2 logs djdannyhecticb --err
```

### Check Resource Usage

```bash
# Real-time monitoring
pm2 monit

# Status overview
pm2 status
```

### Setup Log Rotation

```bash
pm2 install pm2-logrotate

# Configure (optional)
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🎯 Quick Reference

### After Code Changes (Local)

```bash
pnpm build
~/deploy-djdannyhecticb.sh
```

### View Site Status (Server)

```bash
pm2 ls
pm2 logs djdannyhecticb --lines 20
curl http://127.0.0.1:3005
```

### Restart After Config Changes (Server)

```bash
pm2 restart djdannyhecticb
```

### Full Reset (Server)

```bash
pm2 delete djdannyhecticb
pm2 start /srv/djdannyhecticb/dist/index.mjs --name djdannyhecticb
pm2 save
```

---

## ✅ Success Checklist

- [ ] Node.js 18+ installed on server
- [ ] PM2 installed globally
- [ ] nginx installed and configured
- [ ] MySQL database running
- [ ] `.env` file created with all variables
- [ ] Build completes successfully (`dist/` folder exists)
- [ ] Files deployed to `/srv/djdannyhecticb/`
- [ ] PM2 shows app status as "online"
- [ ] nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] Site accessible at https://djdannyhecticb.com

---

## 🆘 Need Help?

If you're stuck:

1. **Check PM2 logs**: `pm2 logs djdannyhecticb --lines 100`
2. **Check nginx logs**: `sudo tail -f /var/log/nginx/error.log`
3. **Verify build**: `ls -la /srv/djdannyhecticb/dist/`
4. **Test Node app directly**: `curl http://127.0.0.1:3005`
5. **Check environment variables**: `cat /srv/djdannyhecticb/.env`

---

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Let's Encrypt Certbot](https://certbot.eff.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
