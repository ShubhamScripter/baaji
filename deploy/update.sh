#!/bin/bash
set -e

# ============================================
# BaajiHub Quick Update Script
# Run this after git push to update the server
# ============================================

APP_DIR="/www/wwwroot/baajihub"
PM2_NAME="baajihub"
BRANCH="main"

echo "Updating BaajiHub..."

cd "$APP_DIR"
git fetch origin
git reset --hard "origin/$BRANCH"
git clean -fd

# Rebuild frontend
echo "Building frontend..."
cd frontend
npm install --legacy-peer-deps
npm run build

# Rebuild admin
echo "Building admin..."
cd ../admin
npm install --legacy-peer-deps
npm run build

# Update backend deps & restart
echo "Updating backend..."
cd ../aura-backend
npm install --legacy-peer-deps
pm2 restart "$PM2_NAME"

echo ""
echo "Update complete! Both sites are live."
echo "  https://baajihub.com"
echo "  https://ag.baajihub.com"
