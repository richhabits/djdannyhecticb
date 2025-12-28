# Deployment Guide for DJ Danny Hectic B

This repository is ready for production deployment on your server (`213.199.45.126`).

## Prerequisites
- Docker and Docker Compose installed on the server.
- DNS records for all domains pointing to `213.199.45.126`.
  - `djdannyhecticb.com`
  - `djdannyhecticb.co.uk`
  - `djdannyhecticb.info`
  - `djdannyhecticb.uk`

## Deployment Steps
1. **Copy files to the server**:
   ```bash
   scp -r . root@213.199.45.126:/var/www/djdannyhecticb
   ```
2. **SSH into the server**:
   ```bash
   ssh root@213.199.45.126
   cd /var/www/djdannyhecticb
   ```
3. **Configure Environment**:
   Edit `.env` and set production values for `DATABASE_URL`, `JWT_SECRET`, etc.
4. **Run Deployment Script**:
   ```bash
   ./deploy.sh
   ```

## SSL Configuration (Let's Encrypt)
To enable HTTPS, you can use Certbot:
```bash
docker-compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ -d djdannyhecticb.com -d www.djdannyhecticb.com
```
Then uncomment the SSL certificate lines in `nginx.conf` and restart Nginx:
```bash
docker-compose restart nginx
```

## Theme Information
The website has been updated with a **Vibrant Orange Vibe** inspired by the Wix Skinny Pete template, featuring dark mode backgrounds and high-contrast orange/amber accents.
