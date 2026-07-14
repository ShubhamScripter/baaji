#!/bin/bash
set -e

# ============================================
# BaajiHub Deployment Script
# Server: 93.127.194.184
# Domains: baajihub.com + ag.baajihub.com
# ============================================

APP_DIR="/www/wwwroot/baajihub"
REPO_URL="https://github.com/YOUR_USERNAME/baaji.git"  # <-- apna repo URL daalein
BRANCH="main"
PM2_NAME="baajihub"
NODE_PORT=8000

echo "=============================="
echo " BaajiHub Server Setup"
echo "=============================="

# 1. Install dependencies (if not already)
echo "[1/8] Installing system dependencies..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
fi

# 2. Clone or update repo
echo "[2/8] Setting up application directory..."
if [ ! -d "$APP_DIR" ]; then
    mkdir -p "$APP_DIR"
    git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
else
    cd "$APP_DIR"
    git fetch origin
    git reset --hard "origin/$BRANCH"
    git clean -fd
fi

cd "$APP_DIR"

# 3. Install backend dependencies
echo "[3/8] Installing backend dependencies..."
cd aura-backend
npm install --legacy-peer-deps

# 4. Build frontend
echo "[4/8] Building frontend..."
cd ../frontend
echo "VITE_IS_LOCAL=false" > .env
npm install --legacy-peer-deps
npm run build

# 5. Build admin
echo "[5/8] Building admin panel..."
cd ../admin
echo "VITE_IS_LOCAL=false" > .env
npm install --legacy-peer-deps
npm run build

# 6. Setup .env for backend (only if not exists)
echo "[6/8] Checking backend .env..."
cd ../aura-backend
if [ ! -f .env ]; then
    echo "ERROR: .env file not found in aura-backend/"
    echo "Please create .env with your configuration before running this script."
    exit 1
fi

# Ensure production settings in .env
if ! grep -q "NODE_ENV=production" .env; then
    echo "" >> .env
    echo "NODE_ENV=production" >> .env
fi
if ! grep -q "APP_TYPE=unified" .env; then
    echo "APP_TYPE=unified" >> .env
fi
if ! grep -q "^PORT=" .env; then
    echo "PORT=$NODE_PORT" >> .env
fi

# 7. Setup Nginx
echo "[7/8] Configuring Nginx..."
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/baajihub
ln -sf /etc/nginx/sites-available/baajihub /etc/nginx/sites-enabled/baajihub
rm -f /etc/nginx/sites-enabled/default

# SSL Certificates (Let's Encrypt)
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
fi

# Check if certs exist, if not generate them
if [ ! -d "/etc/letsencrypt/live/baajihub.com" ]; then
    echo "Generating SSL certificates..."
    certbot --nginx -d baajihub.com -d ag.baajihub.com --non-interactive --agree-tos --email admin@baajihub.com
fi

nginx -t && systemctl reload nginx

# 8. Start/Restart PM2
echo "[8/8] Starting application with PM2..."
cd "$APP_DIR/aura-backend"
pm2 delete "$PM2_NAME" 2>/dev/null || true
pm2 start server.js --name "$PM2_NAME" --env production
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo ""
echo "=============================="
echo " Deployment Complete!"
echo "=============================="
echo ""
echo " Frontend: https://baajihub.com"
echo " Admin:    https://ag.baajihub.com"
echo " API:      https://baajihub.com/api"
echo ""
echo " PM2 Process: $PM2_NAME (port $NODE_PORT)"
echo " Nginx proxies both domains → localhost:$NODE_PORT"
echo ""
echo " Useful commands:"
echo "   pm2 logs $PM2_NAME    - View logs"
echo "   pm2 restart $PM2_NAME - Restart app"
echo "   pm2 monit             - Monitor"
echo ""
