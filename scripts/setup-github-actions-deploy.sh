#!/bin/bash

# Server Setup Script for GitHub Actions Deployment
# DJ Danny Hectic B
#
# This script prepares the server for GitHub Actions automated deployments.
# Run this once on the server before your first deployment.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  GitHub Actions Deployment Setup${NC}"
echo -e "${BLUE}  DJ Danny Hectic B${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if running as the correct user
EXPECTED_USER="hectic"
if [ "$USER" != "$EXPECTED_USER" ]; then
    echo -e "${YELLOW}⚠️  Warning: This script should be run as user '$EXPECTED_USER'${NC}"
    echo -e "${YELLOW}   Current user: $USER${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${YELLOW}[1/6] Creating deployment directories...${NC}"
sudo mkdir -p /srv/djdannyhecticb/{releases,shared}
sudo chown -R $USER:$USER /srv/djdannyhecticb
echo -e "${GREEN}✓ Directories created${NC}"

echo ""
echo -e "${YELLOW}[2/6] Setting up initial release...${NC}"
REL="/srv/djdannyhecticb/releases/initial"
mkdir -p "$REL/public"

cat > "$REL/public/index.html" <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DJ Danny Hectic B - Ready for Deployment</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        h1 {
            font-size: 2.5rem;
            margin: 0 0 1rem 0;
        }
        p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        .status {
            background: rgba(255, 255, 255, 0.2);
            padding: 1rem 2rem;
            border-radius: 8px;
            margin-top: 2rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎵 DJ Danny Hectic B</h1>
        <p>Server is ready for deployment</p>
        <div class="status">
            ✅ GitHub Actions deployment configured<br>
            📦 Waiting for first deploy from main branch...
        </div>
    </div>
</body>
</html>
EOF

echo -e "${GREEN}✓ Initial release created${NC}"

echo ""
echo -e "${YELLOW}[3/6] Creating current symlink...${NC}"
# Remove if it's a directory, not a symlink
if [ -d /srv/djdannyhecticb/current ] && [ ! -L /srv/djdannyhecticb/current ]; then
    echo -e "${YELLOW}   Converting existing directory to symlink...${NC}"
    sudo rm -rf /srv/djdannyhecticb/current
fi

ln -sfn "$REL" /srv/djdannyhecticb/current
echo -e "${GREEN}✓ Symlink created: current -> $REL${NC}"

echo ""
echo -e "${YELLOW}[4/6] Setting permissions...${NC}"
sudo chown -R $USER:$USER /srv/djdannyhecticb
sudo chmod -R a+rX /srv/djdannyhecticb
echo -e "${GREEN}✓ Permissions set${NC}"

echo ""
echo -e "${YELLOW}[5/6] Verifying nginx configuration...${NC}"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✓ nginx configuration is valid${NC}"
else
    echo -e "${RED}✗ nginx configuration has errors${NC}"
    echo "Run: sudo nginx -t"
    exit 1
fi

echo ""
echo -e "${YELLOW}[6/6] Reloading nginx...${NC}"
sudo systemctl reload nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ nginx reloaded successfully${NC}"
else
    echo -e "${RED}✗ nginx failed to reload${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Directory structure:"
ls -la /srv/djdannyhecticb/
echo ""

echo "Current release:"
ls -la /srv/djdannyhecticb/current
echo ""

echo -e "${GREEN}Testing local access...${NC}"
if curl -sI http://127.0.0.1/ | head -1 | grep -q "200"; then
    echo -e "${GREEN}✓ Site is accessible locally${NC}"
else
    echo -e "${YELLOW}⚠️  Site returned non-200 status${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Next Steps:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Configure GitHub Secrets (if not already done):"
echo "   - Go to: Repository → Settings → Secrets → Actions"
echo "   - Add: DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY"
echo ""
echo "2. Ensure your public SSH key is in ~/.ssh/authorized_keys"
echo "   Run: cat ~/.ssh/authorized_keys"
echo ""
echo "3. Test SSH from your GitHub Actions runner:"
echo "   ssh $USER@\$(hostname -I | awk '{print \$1}')"
echo ""
echo "4. Push to main branch to trigger deployment"
echo ""
echo "5. Monitor deployment:"
echo "   - GitHub: Repository → Actions tab"
echo "   - Server: tail -f /var/log/nginx/access.log"
echo ""
echo "📚 Full documentation: DEPLOY_GITHUB_ACTIONS.md"
echo ""
