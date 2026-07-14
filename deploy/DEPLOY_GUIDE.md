# BaajiHub Deployment Guide

## Architecture

```
                    ┌─────────────────────────────┐
                    │      Nginx (Port 80/443)     │
                    │   SSL + Reverse Proxy        │
                    └──────────┬──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
   baajihub.com        ag.baajihub.com     WebSocket
              │                │                │
              └────────────────┼────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │   Node.js (PM2) Port 8000   │
                    │   Single Process - "unified" │
                    │                              │
                    │  hostname = ag.* → admin/dist│
                    │  hostname = *    → frontend/ │
                    │  /api/*         → Express    │
                    │  WebSocket      → ws server  │
                    └──────────────────────────────┘
```

**Ek server, ek process - dono sites serve hoti hain hostname ke basis pe.**

---

## Server Pe First Time Setup

### Step 1: SSH into your server

```bash
ssh root@93.127.194.184 -p 21829
```

### Step 2: Domain DNS Setup

Apne domain registrar (GoDaddy/Namecheap/Cloudflare) mein ye DNS records add karo:

| Type | Name | Value |
|------|------|-------|
| A | baajihub.com | 93.127.194.184 |
| A | ag.baajihub.com | 93.127.194.184 |

### Step 3: Clone repo on server

```bash
mkdir -p /www/wwwroot/baajihub
cd /www/wwwroot/baajihub
git clone https://github.com/YOUR_USERNAME/baaji.git .
```

### Step 4: Backend .env setup (sirf ek baar)

```bash
cp aura-backend/.env.example aura-backend/.env
# OR manually create with your existing .env content
nano aura-backend/.env
```

.env mein ye 3 lines add/update karo (baki sab same rahega):

```
NODE_ENV=production
APP_TYPE=unified
PORT=8000
```

### Step 5: Run setup script

```bash
chmod +x deploy/setup-server.sh
./deploy/setup-server.sh
```

Ye script automatically:
- Node.js, PM2, Nginx install karega
- Frontend + Admin build karega
- SSL certificates generate karega
- Nginx configure karega
- PM2 se app start karega

---

## After Setup - Updates

Jab bhi code push karo `main` branch pe, server pe run karo:

```bash
cd /www/wwwroot/baajihub
chmod +x deploy/update.sh
./deploy/update.sh
```

Ya GitHub Actions se automatic deploy hoga (push to `main`).

---

## Key Points

| Feature | Detail |
|---------|--------|
| Frontend URL | https://baajihub.com |
| Admin URL | https://ag.baajihub.com |
| API URL | https://baajihub.com/api (same for both) |
| WebSocket | wss://baajihub.com (auto-detected) |
| PM2 Process | `baajihub` (single process) |
| Port | 8000 (internal, Nginx handles 80/443) |

## Env Changes Required?

**KUCHH BHI CHANGE NAHI!**

- **Local dev:** `localhost` detect hota hai → `http://localhost:3000/api` use hota hai
- **Production:** domain detect hota hai → `/api` (same-origin) use hota hai
- **Backend:** automatically detect karta hai ki `frontend/dist` aur `admin/dist` dono exist karte hain → unified mode
- `.env` bilkul same rahega local aur server dono pe
- Server pe sirf `PORT=8000` add hota hai (setup script automatically karta hai) for Nginx

---

## Useful Commands (on server)

```bash
pm2 logs baajihub          # Logs dekho
pm2 restart baajihub       # Restart
pm2 monit                  # CPU/Memory monitor
nginx -t                   # Nginx config test
systemctl reload nginx     # Nginx reload
certbot renew              # SSL renew (auto cron bhi set hota h)
```

---

## Troubleshooting

### Site not loading?
```bash
pm2 status                 # Check if process is running
pm2 logs baajihub --lines 50  # Check for errors
nginx -t                   # Check nginx config
```

### WebSocket not connecting?
- Nginx config mein Upgrade headers check karo
- `proxy_read_timeout 86400;` hona chahiye

### SSL Certificate expired?
```bash
certbot renew
systemctl reload nginx
```
