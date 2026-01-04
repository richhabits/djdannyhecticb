# Deployment Guide for DJ Danny Hectic B

This guide will help you deploy your site to production at **213.199.45.126** with full HTTPS support.

## 🚨 Current Issue

Your site is down because nginx is trying to use SSL certificates that don't exist yet. This guide uses a **two-phase approach** to get your site online safely.

---

## Prerequisites

- ✅ Docker and Docker Compose installed on server
- ✅ DNS records pointing to **213.199.45.126**:
  - `djdannyhecticb.com`
  - `djdannyhecticb.co.uk`
  - `djdannyhecticb.info`
  - `djdannyhecticb.uk`
- ✅ SSH access to the server
- ✅ Ports 80 and 443 open in firewall

---

## 📦 Phase 1: Deploy with HTTP (Get Site Online)

### Step 1: Copy Files to Server

From your local machine:

```bash
# Navigate to project directory
cd /Users/romeovalentine/DjDannyHecticB

# Copy all files to server
scp -r . root@213.199.45.126:/var/www/djdannyhecticb
```

### Step 2: SSH into Server

```bash
ssh root@213.199.45.126
cd /var/www/djdannyhecticb
```

### Step 3: Configure Environment

```bash
# Edit .env file with production values
nano .env
```

**Required environment variables:**
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Strong random secret for authentication
- `GEMINI_API_KEY` - Your Google Gemini API key (if using AI features)

### Step 4: Make Scripts Executable

```bash
chmod +x deploy.sh
chmod +x setup-ssl.sh
```

### Step 5: Deploy with HTTP

```bash
./deploy.sh
```

This will:
- Build the Docker containers
- Start all services (db, web, nginx, certbot)
- Use HTTP-only nginx configuration
- Display deployment status

### Step 6: Verify HTTP Access

Visit these URLs to confirm the site is working:
- http://djdannyhecticb.co.uk (Primary)
- http://www.djdannyhecticb.co.uk
- http://djdannyhecticb.com
- http://213.199.45.126

**✅ If the site loads, proceed to Phase 2!**

---

## 🔐 Phase 2: Enable HTTPS (Add SSL Certificates)

### Step 1: Run SSL Setup Script

While still SSH'd into the server:

```bash
./setup-ssl.sh
```

You will be prompted for:
- **Email address** - For Let's Encrypt certificate notifications

The script will:
1. Generate SSL certificates for all domains
2. Automatically switch nginx to HTTPS configuration
3. Restart nginx with SSL enabled
4. Set up automatic certificate renewal

### Step 2: Verify HTTPS Access

Visit these URLs to confirm HTTPS is working:
- https://djdannyhecticb.co.uk (Primary)
- https://www.djdannyhecticb.co.uk
- https://djdannyhecticb.com
- https://djdannyhecticb.info
- https://djdannyhecticb.uk

**All HTTP traffic should automatically redirect to HTTPS!**

---

## 🔧 Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f nginx
docker-compose logs -f db
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart nginx
```

### Stop Services
```bash
docker-compose down
```

### Update Deployment
```bash
# Pull latest code (if using git)
git pull origin main

# Rebuild and restart
docker-compose up -d --build
```

### Check Certificate Status
```bash
docker-compose exec certbot certbot certificates
```

---

## 🐛 Troubleshooting

### Issue: SSL Certificate Generation Fails

**Possible causes:**
1. DNS records not propagated yet
2. Firewall blocking port 80
3. nginx not running

**Solutions:**
```bash
# Check DNS propagation
nslookup djdannyhecticb.com

# Check if nginx is running
docker-compose ps

# Check nginx logs
docker-compose logs nginx

# Verify port 80 is accessible
curl -I http://213.199.45.126
```

### Issue: Site Not Loading

```bash
# Check all containers are running
docker-compose ps

# Check web app logs
docker-compose logs web

# Check database connection
docker-compose exec web npm run db:push
```

### Issue: Database Connection Error

```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify DATABASE_URL in .env matches docker-compose.yml
```

---

## 📋 Certificate Auto-Renewal

The certbot container automatically renews certificates every 12 hours. No manual intervention required!

To manually renew:
```bash
docker-compose exec certbot certbot renew
docker-compose restart nginx
```

---

## 🎨 Theme Information

The website features a **Vibrant Orange Vibe** inspired by the Wix Skinny Pete template:
- Dark mode backgrounds
- High-contrast orange/amber accents
- Modern, responsive design

---

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify DNS settings
3. Ensure firewall allows ports 80 and 443
4. Check `.env` file has correct values

