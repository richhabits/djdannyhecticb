# Quick Server Setup - DJ Danny Hectic B

This is a condensed version of the deployment process for quick reference.

## 🚀 One-Time Server Setup

SSH into your server and run these commands:

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /srv/djdannyhecticb
sudo chown $USER:$USER /srv/djdannyhecticb
```

## 📝 Environment Setup

Create `/srv/djdannyhecticb/.env`:

```bash
NODE_ENV=production
PORT=3005
HOST=127.0.0.1
DATABASE_URL=mysql://user:password@localhost:3306/djdannyhecticb
JWT_SECRET=change-this-to-random-secret
SESSION_SECRET=change-this-to-random-secret
```

## 🔨 Build & Deploy (Local Machine)

```bash
# Navigate to project
cd /Users/romeovalentine/Downloads/djdannyhecticb-main

# Install dependencies
pnpm install

# Build
pnpm build

# Verify
./verify-build.sh

# Deploy (automated)
./deploy-pm2.sh
```

## 🌐 nginx Configuration

Create `/etc/nginx/sites-available/djdannyhecticb.com`:

```nginx
server {
    listen 80;
    server_name djdannyhecticb.com www.djdannyhecticb.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name djdannyhecticb.com www.djdannyhecticb.com;

    ssl_certificate /etc/letsencrypt/live/djdannyhecticb.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/djdannyhecticb.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/djdannyhecticb.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔐 SSL Certificate

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d djdannyhecticb.com -d www.djdannyhecticb.com
```

## ▶️ Start Application

```bash
cd /srv/djdannyhecticb
pm2 start dist/index.mjs --name djdannyhecticb
pm2 save
pm2 startup  # Run the command it outputs
```

## 🔄 Update Deployment

When you make changes:

```bash
# Local machine
pnpm build
./deploy-pm2.sh
```

## 🐛 Quick Troubleshooting

```bash
# Check PM2 status
pm2 ls

# View logs
pm2 logs djdannyhecticb

# Restart app
pm2 restart djdannyhecticb

# Test app directly
curl http://127.0.0.1:3005

# Check nginx
sudo nginx -t
sudo systemctl status nginx
```

## ✅ Verification Checklist

- [ ] Node.js 20+ installed on server
- [ ] PM2 installed globally  
- [ ] `/srv/djdannyhecticb/.env` configured
- [ ] Build completed locally (dist/ folder exists)
- [ ] Files deployed to server
- [ ] PM2 shows status "online"
- [ ] nginx configured and running
- [ ] SSL certificate installed
- [ ] Site loads at https://djdannyhecticb.com

---

For detailed instructions, see [README_DEPLOY_PM2.md](README_DEPLOY_PM2.md)
