# DJ Danny Hectic B - Production Deployment Guide

## Prerequisites

- Node.js 20+ and pnpm
- MySQL 8.0+ database
- Domain name with SSL certificate
- Server with at least 2GB RAM

## Quick Deploy with Docker

### 1. Clone and Configure

```bash
git clone <your-repo>
cd djdannyhecticb

# Copy environment template
cp .env.example .env

# Edit .env with production values
nano .env
```

### 2. Build and Run

```bash
# Build and start with Docker Compose
docker-compose up -d

# Run database migrations
docker-compose exec app pnpm db:push

# Seed initial data
docker-compose exec app pnpm db:seed

# Check logs
docker-compose logs -f app
```

## Manual Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

### 2. Database Setup

```bash
# Create database and user
sudo mysql

CREATE DATABASE djdannyhecticb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'djdanny'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON djdannyhecticb.* TO 'djdanny'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Application Setup

```bash
# Clone repository
git clone <your-repo> /var/www/djdannyhecticb
cd /var/www/djdannyhecticb

# Install dependencies
pnpm install --prod

# Build application
pnpm build

# Set up environment
cp .env.example .env
nano .env  # Edit with production values

# Run migrations
pnpm db:push

# Seed database
pnpm db:seed
```

### 4. Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/index.js --name djdanny-app

# Set up PM2 to start on boot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### 5. Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/djdannyhecticb
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name djdannyhecticb.com www.djdannyhecticb.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name djdannyhecticb.com www.djdannyhecticb.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/djdannyhecticb.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/djdannyhecticb.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Max upload size
    client_max_body_size 50M;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /assets {
        alias /var/www/djdannyhecticb/dist/public/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/djdannyhecticb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d djdannyhecticb.com -d www.djdannyhecticb.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

### 7. Firewall

```bash
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

## Platform-Specific Deployments

### Railway

1. Connect GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Set build command: `pnpm build`
4. Set start command: `pnpm start`
5. Add MySQL database from Railway marketplace

### Vercel (Frontend + Serverless Functions)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### AWS (EC2 + RDS)

1. Launch EC2 instance (t3.medium recommended)
2. Create RDS MySQL instance
3. Follow manual deployment steps above
4. Configure security groups
5. Set up CloudWatch monitoring

### DigitalOcean App Platform

1. Connect GitHub repository
2. Configure as Node.js app
3. Add environment variables
4. Add managed MySQL database
5. Deploy

## Environment Variables for Production

Required variables in `.env`:

```env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=mysql://user:password@host:port/dbname

# OAuth & Auth
OAUTH_SERVER_URL=https://yourdomain.com
APP_ID=your-app-id
JWT_SECRET=strong-random-secret

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Email (Resend)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=DJ Danny Hectic B <noreply@yourdomain.com>
EMAIL_REPLY_TO=bookings@yourdomain.com

# AI Services
OPENAI_API_KEY=sk-proj-xxxxx
ELEVENLABS_API_KEY=xxxxx
REPLICATE_API_KEY=r8_xxxxx

# AWS S3
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=eu-west-2

# Analytics
SENTRY_DSN=https://xxxxx
VITE_GOOGLE_ANALYTICS_ID=G-XXXXX

# Social APIs
SPOTIFY_CLIENT_ID=xxxxx
SPOTIFY_CLIENT_SECRET=xxxxx
YOUTUBE_API_KEY=xxxxx
```

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Database seeded with initial data
- [ ] SSL certificate installed and working
- [ ] Environment variables set correctly
- [ ] Application starts without errors
- [ ] Health check endpoint responding
- [ ] Stripe webhook endpoint configured
- [ ] Email sending working
- [ ] File uploads working (S3)
- [ ] Analytics tracking working
- [ ] Error monitoring active (Sentry)
- [ ] Backup system configured
- [ ] Monitoring alerts set up

## Monitoring & Maintenance

### Check Application Status

```bash
# PM2 status
pm2 status

# View logs
pm2 logs djdanny-app

# Restart application
pm2 restart djdanny-app
```

### Database Backup

```bash
# Backup database
mysqldump -u djdanny -p djdannyhecticb > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u djdanny -p djdannyhecticb < backup_20231205.sql
```

### Update Application

```bash
cd /var/www/djdannyhecticb
git pull
pnpm install --prod
pnpm build
pnpm db:push  # Run migrations if needed
pm2 restart djdanny-app
```

## Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs djdanny-app --lines 100

# Check environment
pm2 env 0

# Test database connection
node -e "console.log(process.env.DATABASE_URL)"
```

### Database connection issues

```bash
# Test MySQL connection
mysql -h localhost -u djdanny -p djdannyhecticb

# Check MySQL status
sudo systemctl status mysql
```

### High memory usage

```bash
# Check memory
free -h

# Restart application
pm2 restart djdanny-app

# Clear PM2 logs
pm2 flush
```

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Rotate secrets regularly** - Change JWT_SECRET, API keys every 90 days
3. **Use strong passwords** - For database, admin accounts
4. **Keep dependencies updated** - Run `pnpm update` regularly
5. **Monitor error logs** - Check Sentry daily
6. **Regular backups** - Daily database backups, weekly full backups
7. **Rate limiting** - Already configured in application
8. **HTTPS only** - Enforce SSL/TLS
9. **Firewall rules** - Restrict access to necessary ports
10. **Security headers** - Already configured in Nginx

## Support

For deployment issues, check:
- Application logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/error.log`
- System logs: `journalctl -xe`
- Database logs: `/var/log/mysql/error.log`
