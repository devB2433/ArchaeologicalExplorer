# Docker Deployment Guide

Complete guide for deploying Archaeological Explorer using Docker with data-program separation architecture.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Deployment Steps](#deployment-steps)
- [Configuration](#configuration)
- [SafeLine WAF Setup](#safeline-waf-setup)
- [Data Management](#data-management)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
Internet (HTTPS 443)
    ↓
ancientecho.ca (147.93.184.68)
    ↓
┌─────────────────────────────────────────┐
│  Server (147.93.184.68)                 │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  SafeLine WAF (80/443)            │ │
│  │  - Let's Encrypt SSL              │ │
│  │  - Reverse Proxy → 127.0.0.1:3001│ │
│  └───────────────────────────────────┘ │
│              ↓                          │
│  ┌───────────────────────────────────┐ │
│  │  Docker: archaeology-game-app     │ │
│  │  (127.0.0.1:3001)                 │ │
│  │  - Node.js + Express              │ │
│  │  - Static File Service            │ │
│  └───────────────────────────────────┘ │
│              ↓                          │
│  ┌───────────────────────────────────┐ │
│  │  Docker Volume                     │ │
│  │  archaeology-game-data             │ │
│  │  - database.sqlite                 │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Key Features

- **Data-Program Separation**: Application container is stateless, data stored in Docker volume
- **Security**: Port 3001 bound to localhost only, accessible through WAF only
- **Auto-restart**: Container automatically restarts on failure
- **Health Monitoring**: Built-in health check endpoint
- **Easy Backup**: Simple backup and restore scripts

---

## 📦 Prerequisites

### Server Requirements

- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **CPU**: 1 core minimum (2 cores recommended)
- **RAM**: 512MB minimum (1GB recommended)
- **Disk**: 5GB free space
- **Network**: Public IP address

### Software Requirements

```bash
# Docker Engine
docker --version  # Should be 20.10+

# Docker Compose (optional but recommended)
docker-compose --version  # Should be 1.29+

# Git
git --version
```

### Install Docker (if not installed)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group (optional)
sudo usermod -aG docker $USER
# Logout and login again to take effect
```

---

## 🚀 Deployment Steps

### Step 1: DNS Configuration

Configure DNS records at your domain registrar:

```
Type    Host    Value
A       @       147.93.184.68
A       www     147.93.184.68
```

**Verify DNS propagation:**
```bash
ping ancientecho.ca
# Should return: 147.93.184.68
```

---

### Step 2: Prepare Code on Server

```bash
# Clone repository
cd /opt
git clone <your-repository-url> archaeology-game
cd archaeology-game

# Or upload via SCP (from local machine)
# scp -r archaeology-game/ user@147.93.184.68:/opt/
```

---

### Step 3: Environment Configuration

```bash
# Copy environment template
cp .env.production .env

# Edit configuration
nano .env
```

**Required modifications in `.env`:**

```bash
# Email credentials
EMAIL_PASS="your-email-password-here"  # Use quotes!

# Security secret (generate new one)
JWT_SECRET=$(openssl rand -base64 32)

# Application settings
APP_DOMAIN=ancientecho.ca
APP_URL=https://ancientecho.ca
```

---

### Step 4: Set Script Permissions

```bash
chmod +x deploy.sh backup.sh restore.sh
```

---

### Step 5: Deploy Application

**Option A: Using deployment script (recommended)**

```bash
./deploy.sh
```

The script will automatically:
- ✅ Create data volume
- ✅ Validate configuration
- ✅ Build Docker image
- ✅ Stop old container
- ✅ Start new container
- ✅ Run health check
- ✅ Clean up old images

**Option B: Using Docker Compose**

```bash
docker-compose up -d --build
```

**Option C: Manual deployment**

```bash
# 1. Create data volume
docker volume create archaeology-game-data

# 2. Build image
docker build -t archaeology-game:latest .

# 3. Run container
docker run -d \
  --name archaeology-game-app \
  -p 127.0.0.1:3001:3001 \
  -v archaeology-game-data:/app/data \
  -v $(pwd)/.env:/app/.env:ro \
  --restart unless-stopped \
  archaeology-game:latest
```

---

### Step 6: Verify Deployment

```bash
# Check container status
docker ps

# Expected output:
# CONTAINER ID   IMAGE                     STATUS         PORTS
# xxxxxxxxx      archaeology-game:latest   Up 2 minutes   127.0.0.1:3001->3001/tcp

# View logs
docker logs -f archaeology-game-app

# Test health endpoint
curl http://127.0.0.1:3001/api/health

# Expected response:
# {"status":"ok"}
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_SERVICE` | Email service provider | `hostinger` |
| `EMAIL_USER` | Email address | `hello@pokemonrangers.com` |
| `EMAIL_PASS` | Email password | `"your-password"` |
| `SMTP_HOST` | SMTP server | `smtp.hostinger.com` |
| `SMTP_PORT` | SMTP port | `465` |
| `PORT` | Application port | `3001` |
| `NODE_ENV` | Environment | `production` |
| `JWT_SECRET` | JWT secret key | Random 32-byte string |
| `APP_DOMAIN` | Application domain | `ancientecho.ca` |
| `DB_PATH` | Database path | `/app/data/database.sqlite` |

---

## 🛡️ SafeLine WAF Setup

### Step 1: Add Protected Site

Login to SafeLine admin panel and configure:

```
Site Name: Ancient Echo
Domains:
  - ancientecho.ca
  - www.ancientecho.ca

Listening Ports:
  - 80 (HTTP)
  - 443 (HTTPS)

SSL Certificate:
  - Type: Auto-apply Let's Encrypt
  - Domains: ancientecho.ca, www.ancientecho.ca
  - Auto-renew: Enabled

Upstream Server:
  - Protocol: HTTP
  - Address: 127.0.0.1
  - Port: 3001
  - Health Check: /api/health (optional)

Security Settings:
  - Web Protection: Enabled
  - CC Protection: Enabled
  - HTTP to HTTPS: Enabled (redirect)
```

### Step 2: SSL Certificate

SafeLine will automatically:
- Request Let's Encrypt certificate
- Configure HTTPS
- Set up auto-renewal
- Handle certificate challenges

**Manual verification:**
```bash
# Check certificate
curl -I https://ancientecho.ca

# Should see:
# HTTP/2 200
# server: nginx
```

---

## 💾 Data Management

### Backup

**Manual backup:**
```bash
./backup.sh
```

Backup files are saved to `./backups/` with timestamp:
```
backups/
└── archaeology-game-backup-20240115_020000.tar.gz
```

**Automatic backup (daily at 2 AM):**
```bash
# Edit crontab
crontab -e

# Add this line:
0 2 * * * cd /opt/archaeology-game && ./backup.sh
```

### Restore

```bash
# List available backups
ls -lh backups/

# Restore from specific backup
./restore.sh backups/archaeology-game-backup-20240115_020000.tar.gz
```

**⚠️ Warning:** Restore operation will replace all current data!

### Manual Data Access

```bash
# Access database inside container
docker exec -it archaeology-game-app sh
sqlite3 /app/data/database.sqlite

# Copy database to host
docker cp archaeology-game-app:/app/data/database.sqlite ./database-backup.sqlite

# Copy database to container
docker cp ./database.sqlite archaeology-game-app:/app/data/database.sqlite
docker restart archaeology-game-app
```

---

## 🔄 Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Redeploy (will rebuild image)
./deploy.sh
```

### Container Operations

```bash
# View logs (follow mode)
docker logs -f archaeology-game-app

# View last 100 lines
docker logs --tail 100 archaeology-game-app

# Restart container
docker restart archaeology-game-app

# Stop container
docker stop archaeology-game-app

# Start container
docker start archaeology-game-app

# Access container shell
docker exec -it archaeology-game-app sh

# View resource usage
docker stats archaeology-game-app
```

### Volume Operations

```bash
# Inspect volume
docker volume inspect archaeology-game-data

# List all volumes
docker volume ls

# Volume location on host
docker volume inspect archaeology-game-data | grep Mountpoint
```

### Clean Up

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes (DANGEROUS!)
docker volume prune  # Be careful!

# Remove everything unused
docker system prune -a
```

---

## 🔧 Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker logs archaeology-game-app
```

**Common issues:**

1. **Port already in use:**
```bash
# Find process using port 3001
lsof -i :3001
# or
netstat -tulpn | grep 3001

# Kill the process
kill -9 <PID>
```

2. **Missing .env file:**
```bash
# Verify file exists
ls -la .env

# Check permissions
chmod 644 .env
```

3. **Database permission error:**
```bash
# Fix volume permissions
docker exec -it archaeology-game-app sh
chown -R nodejs:nodejs /app/data
```

### SSL Certificate Issues

**Certificate not issued:**
- Verify DNS points to correct IP
- Check port 80 is accessible from internet
- Wait 5-10 minutes for DNS propagation

**Certificate expired:**
- SafeLine should auto-renew
- Manual renewal: Check SafeLine logs

### Application Errors

**500 Internal Server Error:**
```bash
# Check application logs
docker logs archaeology-game-app

# Common causes:
# - Database connection error
# - Missing environment variables
# - Email service configuration error
```

**API not responding:**
```bash
# Test health endpoint
curl http://127.0.0.1:3001/api/health

# Check if container is running
docker ps

# Restart container
docker restart archaeology-game-app
```

### Performance Issues

**High memory usage:**
```bash
# Check resource usage
docker stats archaeology-game-app

# Adjust memory limits in docker-compose.yml:
# memory: 512M → 1G
```

**Slow response:**
```bash
# Check database size
docker exec archaeology-game-app du -sh /app/data

# Optimize database (inside container)
docker exec -it archaeology-game-app sh
sqlite3 /app/data/database.sqlite "VACUUM;"
```

---

## 📊 Monitoring

### Health Check Endpoint

```bash
curl http://127.0.0.1:3001/api/health
```

**Expected response:**
```json
{"status":"ok"}
```

### Docker Health Status

```bash
docker inspect archaeology-game-app | grep -A 10 Health
```

### Application Logs

```bash
# Real-time logs
docker logs -f archaeology-game-app

# Search logs
docker logs archaeology-game-app 2>&1 | grep ERROR
```

---

## 🔒 Security Best Practices

1. **Never expose port 3001 to public** - Always use `127.0.0.1:3001:3001`
2. **Use strong JWT secret** - Generate with `openssl rand -base64 32`
3. **Keep .env file secure** - Never commit to git
4. **Regular backups** - Set up automated daily backups
5. **Update regularly** - Pull latest security updates
6. **Monitor logs** - Watch for suspicious activities
7. **Use HTTPS only** - Enable HTTP to HTTPS redirect in SafeLine

---

## 📝 Quick Reference

### Essential Commands

```bash
# Deploy/Update
./deploy.sh

# Backup
./backup.sh

# Restore
./restore.sh backups/archaeology-game-backup-YYYYMMDD_HHMMSS.tar.gz

# View logs
docker logs -f archaeology-game-app

# Restart
docker restart archaeology-game-app

# Shell access
docker exec -it archaeology-game-app sh
```

### File Structure

```
archaeology-game/
├── Dockerfile              # Docker image definition
├── .dockerignore          # Files to exclude from image
├── docker-compose.yml     # Container orchestration
├── deploy.sh              # Deployment script
├── backup.sh              # Backup script
├── restore.sh             # Restore script
├── .env                   # Environment configuration (create from .env.production)
├── .env.production        # Environment template
├── server/                # Backend code
├── dist/                  # Frontend built files (generated)
└── public/                # Static assets
```

---

## 🆘 Support

### Useful Links

- Docker Documentation: https://docs.docker.com/
- SafeLine WAF: https://github.com/chaitin/safeline
- Let's Encrypt: https://letsencrypt.org/

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 3001 in use | `lsof -i :3001` then `kill -9 <PID>` |
| Container stops immediately | Check logs: `docker logs archaeology-game-app` |
| Can't access from browser | Verify SafeLine WAF configuration |
| Database locked | Restart container: `docker restart archaeology-game-app` |
| SSL certificate error | Wait for DNS propagation (5-30 min) |

---

## 📌 Deployment Checklist

- [ ] Server has Docker installed
- [ ] DNS records configured (A records)
- [ ] Code uploaded/cloned to `/opt/archaeology-game`
- [ ] `.env` file created and configured
- [ ] Scripts have execute permission (`chmod +x`)
- [ ] Data volume created
- [ ] Container deployed and running
- [ ] Health check passing
- [ ] SafeLine WAF configured
- [ ] SSL certificate issued
- [ ] HTTPS working
- [ ] Backup script tested
- [ ] Automatic backups scheduled

---

**Deployment completed!** 🎉

Access your application at: **https://ancientecho.ca**
