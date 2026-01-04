# Server Deployment Commands

## Quick Reference for Server Deployment

### Initial Setup (Run on Server)

```bash
# 1. Navigate to project directory
cd /var/www/djdannyhecticb

# 2. Make scripts executable
chmod +x deploy.sh setup-ssl.sh

# 3. Configure environment
nano .env
# Set: DATABASE_URL, JWT_SECRET, GEMINI_API_KEY

# 4. Deploy with HTTP
./deploy.sh

# 5. Verify HTTP works
curl -I http://djdannyhecticb.com

# 6. Enable HTTPS
./setup-ssl.sh

# 7. Verify HTTPS works
curl -I https://djdannyhecticb.com
```

### From Local Machine

```bash
# Copy files to server
cd /Users/romeovalentine/DjDannyHecticB
scp -r . root@213.199.45.126:/var/www/djdannyhecticb

# SSH into server
ssh root@213.199.45.126
```

### Monitoring

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f nginx
docker-compose logs -f web

# Check container status
docker-compose ps
```

### Troubleshooting

```bash
# Restart all services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# Stop everything
docker-compose down

# Check nginx config
docker-compose exec nginx nginx -t
```
