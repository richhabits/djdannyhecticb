#!/usr/bin/env bash
set -euo pipefail

echo "====== DJ Danny Hectic B - Server Setup ======"
echo ""

# 1) Create directory structure
echo "[1/5] Creating directory structure..."
sudo mkdir -p /srv/djdannyhecticb/{releases,shared,repo}
sudo chown -R hectic:hectic /srv/djdannyhecticb
sudo chmod -R a+rX /srv/djdannyhecticb
echo "✓ Directories created"

# 2) Install Node + pnpm
echo ""
echo "[2/5] Installing Node.js and pnpm..."
if ! command -v node >/dev/null 2>&1; then
    echo "Installing Node.js..."
    sudo apt update
    sudo apt install -y nodejs
fi
echo "Node.js version: $(node -v)"

if ! command -v corepack >/dev/null 2>&1; then
    echo "corepack not found, you may need to install it manually"
    exit 1
fi

corepack enable
corepack prepare pnpm@9.15.5 --activate
echo "✓ pnpm version: $(pnpm -v)"

# 3) Install nginx configuration
echo ""
echo "[3/5] Installing nginx configuration..."
sudo tee /etc/nginx/sites-available/djdannyhecticb.com >/dev/null <<'NGINX'
server {
  listen 80;
  listen [::]:80;
  server_name djdannyhecticb.com www.djdannyhecticb.com;
  location /.well-known/acme-challenge/ { allow all; }
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name djdannyhecticb.com www.djdannyhecticb.com;

  ssl_certificate     /etc/letsencrypt/live/djdannyhecticb.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/djdannyhecticb.com/privkey.pem;

  root /srv/djdannyhecticb/current/public;
  index index.html;

  server_tokens off;
  client_max_body_size 20m;

  # Drop bot/probe garbage fast
  location ~* ^/(\.env|\.git|wp-admin|wordpress|wp-content|phpmyadmin|pma|db\.sql|dump\.sql|backup\.sql) { return 444; }

  location / { try_files $uri $uri/ /index.html; }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/djdannyhecticb.com /etc/nginx/sites-enabled/djdannyhecticb.com

if sudo nginx -t 2>&1; then
    echo "✓ nginx configuration valid"
else
    echo "⚠ nginx configuration has errors, please review"
fi

# 4) Create placeholder
echo ""
echo "[4/5] Creating placeholder index..."
sudo install -d -o hectic -g hectic -m 755 /srv/djdannyhecticb/current/public
sudo bash -lc 'cat > /srv/djdannyhecticb/current/public/index.html << "EOF"
<!DOCTYPE html>
<html>
<head><title>DJ Danny Hectic B</title></head>
<body>
<h1>Deploy pipeline online</h1>
<p>Waiting for first deployment...</p>
</body>
</html>
EOF'
sudo chown -R hectic:hectic /srv/djdannyhecticb/current
echo "✓ Placeholder created"

# 5) Install deploy scripts
echo ""
echo "[5/5] Installing deploy scripts..."

# Copy deploy script from repo if exists, otherwise create it
if [ -f "scripts/server/deploy-djdannyhecticb-static.sh" ]; then
    sudo cp scripts/server/deploy-djdannyhecticb-static.sh /usr/local/bin/
    sudo chmod +x /usr/local/bin/deploy-djdannyhecticb-static.sh
    echo "✓ Deploy script installed from repo"
else
    echo "⚠ Deploy script not found in repo, install it manually"
fi

# Copy rollback script
if [ -f "scripts/server/rollback-djdannyhecticb.sh" ]; then
    sudo cp scripts/server/rollback-djdannyhecticb.sh /usr/local/bin/
    sudo chmod +x /usr/local/bin/rollback-djdannyhecticb.sh
    echo "✓ Rollback script installed from repo"
else
    echo "⚠ Rollback script not found in repo, install it manually"
fi

# Reload nginx
if sudo systemctl reload nginx 2>&1; then
    echo "✓ nginx reloaded"
fi

echo ""
echo "====== Setup Complete! ======"
echo ""
echo "Next steps:"
echo "1. Configure GitHub Secrets (DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY)"
echo "2. Push to main branch to trigger deployment"
echo "3. Monitor: sudo journalctl -u nginx -f"
echo ""
echo "Manual deploy: sudo /usr/local/bin/deploy-djdannyhecticb-static.sh main"
echo "Rollback: sudo /usr/local/bin/rollback-djdannyhecticb.sh"
echo ""
