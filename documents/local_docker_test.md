# Local Docker Testing Guide

Complete guide for testing Docker deployment locally on your development machine before deploying to production server.

## 📋 Table of Contents

- [Why Test Locally](#why-test-locally)
- [Prerequisites](#prerequisites)
- [Understanding the Architecture](#understanding-the-architecture)
- [Testing Steps](#testing-steps)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Cleanup](#cleanup)

---

## 🎯 Why Test Locally

Testing Docker deployment locally before production deployment provides:

- ✅ **Risk Reduction**: Catch issues before they affect production
- ✅ **Faster Iteration**: No need to deploy to server for every test
- ✅ **Cost Savings**: Debug locally without consuming server resources
- ✅ **Confidence**: Ensure deployment works before going live
- ✅ **Learning**: Understand the deployment process in safe environment

---

## 📦 Prerequisites

### Required Software

**1. Docker Desktop**
- Download: https://www.docker.com/products/docker-desktop/
- Version: 20.10+ recommended
- Status: Must be running before testing

**2. Node.js and npm**
- Version: 18+ recommended
- Required for building frontend

**3. Git Bash or PowerShell**
- Windows users can use either
- Scripts provided for both environments

### Verify Installation

```bash
# Check Docker
docker --version
# Expected: Docker version 20.10.x or higher

# Check Docker is running
docker info
# Should show server information without errors

# Check Node.js
node --version
# Expected: v18.x.x or higher

# Check npm
npm --version
# Expected: 9.x.x or higher
```

---

## 🏗️ Understanding the Architecture

### Development Environment vs Docker Deployment

**Development Mode (Current):**
```
┌─────────────────────────────────┐
│  Your Computer                  │
│                                 │
│  Frontend (Vite)                │
│  Port: 5173                     │
│  - Hot reload                   │
│  - Development features         │
│                                 │
│  Backend (Node.js)              │
│  Port: 3001                     │
│  - API endpoints                │
└─────────────────────────────────┘
```

**Docker Deployment (Production-like):**
```
┌─────────────────────────────────┐
│  Docker Container               │
│                                 │
│  Single Process (Node.js)       │
│  Port: 3001                     │
│  ├─ Static Files (Frontend)    │
│  │  - Built from dist/         │
│  │  - No hot reload            │
│  └─ API Endpoints (Backend)    │
│     - Same as development      │
└─────────────────────────────────┘
```

### Key Differences

| Aspect | Development | Docker Local Test | Production |
|--------|-------------|-------------------|------------|
| Ports | 5173 + 3001 | 3001 only | 3001 (internal) |
| Frontend | Live reload | Static build | Static build |
| Access | localhost:5173 | localhost:3001 | domain via WAF |
| Data | Temporary | Docker volume | Docker volume |
| Environment | Development | Production | Production |

---

## 🚀 Testing Steps

### Step 1: Prepare Frontend Build

Before testing Docker, you must build the frontend:

```bash
# Navigate to project root
cd c:\Data\projects\FLL_creation\archaeology-game

# Install dependencies (if not already done)
npm install

# Build frontend for production
npm run build
```

**Expected output:**
```
✓ built in 3.45s
dist/index.html                   0.XX kB
dist/assets/index-XXXXX.js      XXX.XX kB
```

**Verify build:**
```bash
# Check dist folder exists
dir dist
# or
ls dist/

# Should contain:
# - index.html
# - assets/ folder
```

---

### Step 2: Stop Development Servers

Ensure development servers are not using port 3001:

```bash
# Windows - Stop Node.js processes
taskkill /F /IM node.exe

# Or manually close your terminal running:
# - npm run dev
# - node server/index.js
```

**Verify port is free:**
```bash
# Windows
netstat -ano | findstr :3001

# Should return nothing (port is free)
```

---

### Step 3: Run Test Script

**For Windows Users (Recommended):**

```bash
# Double-click test-local.bat
# or run in PowerShell/CMD:
test-local.bat
```

**For Git Bash / WSL Users:**

```bash
# Set permissions (first time only)
chmod +x test-local.sh

# Run test
./test-local.sh
```

---

### Step 4: Monitor the Test

The script will automatically:

**1. Check Docker** ✓
```
Checking Docker...
[OK] Docker is running
```

**2. Create Test Environment** ✓
```
Creating test .env file...
[OK] Test .env created
```

**3. Build Docker Image** ✓
```
Building Docker image...
[+] Building 45.2s (15/15) FINISHED
[OK] Image built
```

**4. Start Container** ✓
```
Starting test container...
[OK] Container started
```

**5. Health Check** ✓
```
Testing health endpoint...
[OK] Health check passed
```

**Success Message:**
```
===============================
  Local test completed!
===============================

Application running at: http://localhost:3001
```

---

## ✅ Verification

### 1. Check Container Status

```bash
# List running containers
docker ps

# Expected output:
CONTAINER ID   IMAGE                  STATUS         PORTS
xxxxxxxxx      archaeology-game:test  Up 2 minutes   0.0.0.0:3001->3001/tcp
```

### 2. View Container Logs

```bash
# Follow logs in real-time
docker logs -f archaeology-game-test

# Expected logs should show:
# ✅ Email service initialized
# ✅ Level system configuration loaded
# ✅ Server running on port 3001
```

### 3. Test Web Access

**Open browser and visit:**
```
http://localhost:3001
```

**Expected result:**
- ✅ Application loads successfully
- ✅ Homepage displays correctly
- ✅ No console errors

### 4. Test API Endpoints

**Health Check:**
```bash
curl http://localhost:3001/api/health
# Expected: {"status":"ok"}
```

**Test Registration (optional):**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 5. Test Application Features

**In the browser:**

1. **Registration Flow**
   - Navigate to registration page
   - Enter test email and password
   - Submit form
   - Check server logs for verification code

2. **Login Flow**
   - Try logging in with test account
   - Verify redirect to home page

3. **API Requests**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Perform actions in app
   - Verify API calls to `/api/*` succeed

---

## 🔧 Troubleshooting

### Issue 1: Docker Not Running

**Symptoms:**
```
[ERROR] Docker is not running
```

**Solution:**
1. Start Docker Desktop
2. Wait for Docker to fully initialize (whale icon should be steady)
3. Run test script again

---

### Issue 2: Port 3001 Already in Use

**Symptoms:**
```
Error starting userland proxy: listen tcp 0.0.0.0:3001: bind: address already in use
```

**Solution:**
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace <PID> with actual process ID)
taskkill /PID <PID> /F

# Or stop development servers
taskkill /F /IM node.exe

# Run test script again
```

---

### Issue 3: Build Fails - No dist/ Folder

**Symptoms:**
```
[WARN] Static files may not be served
```

**Solution:**
```bash
# Build frontend first
npm run build

# Verify dist/ folder exists
dir dist

# Run test script again
```

---

### Issue 4: Container Starts but Exits Immediately

**Symptoms:**
```
[ERROR] Container failed to start
```

**Solution:**
```bash
# Check container logs
docker logs archaeology-game-test

# Common causes:
# 1. Missing .env file
# 2. Database permission error
# 3. Node.js error in code

# View full logs
docker logs --tail 100 archaeology-game-test
```

---

### Issue 5: Health Check Fails

**Symptoms:**
```
[WARN] Health check failed
```

**Solution:**
```bash
# Wait a bit longer (app might still be starting)
timeout /t 10

# Test manually
curl http://localhost:3001/api/health

# Check logs
docker logs archaeology-game-test

# Common causes:
# - App still starting (wait 10-30 seconds)
# - Port not exposed correctly
# - Application error
```

---

### Issue 6: Static Files Not Loading

**Symptoms:**
- Blank page at http://localhost:3001
- 404 errors in browser console

**Solution:**
```bash
# Verify dist/ was copied into container
docker exec archaeology-game-test ls -la /app/dist

# Should show:
# index.html
# assets/

# If missing, rebuild:
npm run build
docker stop archaeology-game-test
docker rm archaeology-game-test
test-local.bat
```

---

## 🧹 Cleanup

### Quick Cleanup

**Windows:**
```bash
test-local-cleanup.bat
```

**Linux/Mac:**
```bash
./test-local-cleanup.sh
```

### Manual Cleanup

**Stop and remove container:**
```bash
docker stop archaeology-game-test
docker rm archaeology-game-test
```

**Remove test data volume (optional):**
```bash
# WARNING: This deletes all test data!
docker volume rm archaeology-game-test-data
```

**Remove test image (optional):**
```bash
# Only if you want to rebuild from scratch
docker rmi archaeology-game:test
```

**Complete cleanup:**
```bash
# Remove everything
docker stop archaeology-game-test
docker rm archaeology-game-test
docker volume rm archaeology-game-test-data
docker rmi archaeology-game:test
```

---

## 📊 Testing Checklist

Before considering test successful, verify:

- [ ] Frontend build completed (`npm run build`)
- [ ] Docker Desktop is running
- [ ] Port 3001 is free
- [ ] Test script runs without errors
- [ ] Container is running (`docker ps`)
- [ ] Health check passes (http://localhost:3001/api/health)
- [ ] Web page loads (http://localhost:3001)
- [ ] Registration works
- [ ] Login works
- [ ] API calls succeed (check Network tab)
- [ ] No console errors in browser
- [ ] Database persists data (test by restarting container)

---

## 🔄 Testing Workflow

### Recommended Testing Process

```
1. Make code changes
   ↓
2. Test locally (npm run dev)
   ↓
3. Build frontend (npm run build)
   ↓
4. Test Docker locally (test-local.bat)
   ↓
5. Verify all features work
   ↓
6. If issues found → Fix → Go to step 1
   ↓
7. If all good → Commit and push
   ↓
8. Deploy to production server
```

---

## 📝 Common Test Scenarios

### Scenario 1: First Time Setup

```bash
# 1. Clone repository
git clone <your-repo>
cd archaeology-game

# 2. Install dependencies
npm install

# 3. Build frontend
npm run build

# 4. Run Docker test
test-local.bat

# 5. Access http://localhost:3001
```

### Scenario 2: After Code Changes

```bash
# 1. Make changes to code

# 2. Rebuild frontend (if frontend changed)
npm run build

# 3. Stop old container
docker stop archaeology-game-test
docker rm archaeology-game-test

# 4. Rebuild and test
test-local.bat
```

### Scenario 3: Testing Database Persistence

```bash
# 1. Start container
test-local.bat

# 2. Create test data (register user, explore, etc.)

# 3. Restart container
docker restart archaeology-game-test

# 4. Verify data persists
# - Login with same account
# - Check if discoveries are saved

# Data is stored in volume: archaeology-game-test-data
```

---

## 🔍 Advanced Testing

### Inspect Container

```bash
# Access container shell
docker exec -it archaeology-game-test sh

# Inside container:
ls -la /app              # View app files
ls -la /app/data         # View data directory
cat /app/.env            # View environment variables
sqlite3 /app/data/database.sqlite  # Access database

# Exit
exit
```

### View Real-time Logs

```bash
# Follow logs
docker logs -f archaeology-game-test

# With timestamps
docker logs -f --timestamps archaeology-game-test

# Last 100 lines
docker logs --tail 100 archaeology-game-test
```

### Check Resource Usage

```bash
# View container stats
docker stats archaeology-game-test

# Shows:
# - CPU usage
# - Memory usage
# - Network I/O
# - Disk I/O
```

### Test with Production Environment Variables

```bash
# Edit .env file (created by test script)
nano .env  # or notepad .env

# Modify variables:
NODE_ENV=production
EMAIL_SERVICE=hostinger
# ... etc

# Restart container
docker restart archaeology-game-test
```

---

## ⚡ Performance Tips

### Speed Up Testing

**1. Cache npm dependencies:**
```bash
# Docker will cache layers, so node_modules won't reinstall every time
# unless package.json changes
```

**2. Skip rebuild if only backend changed:**
```bash
# If you only changed server code, no need to rebuild frontend
# Just rebuild Docker image
docker build -t archaeology-game:test .
```

**3. Use Docker Compose for faster restart:**
```bash
# Alternative to test-local.bat
docker-compose -f docker-compose.yml up -d
```

---

## 🆘 Getting Help

### Check Logs First

90% of issues can be diagnosed from logs:

```bash
docker logs archaeology-game-test
```

### Common Log Patterns

**Success:**
```
✅ Email service initialized
✅ Level system configuration loaded
Server running on port 3001
```

**Error - Missing dist/:**
```
❌ Static directory exists: false
```
**Solution:** Run `npm run build`

**Error - Database:**
```
❌ Database error: SQLITE_CANTOPEN
```
**Solution:** Check volume permissions

**Error - Port in use:**
```
❌ Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:** Stop other services on port 3001

---

## 📌 Quick Reference

### Essential Commands

```bash
# Start test
test-local.bat

# View logs
docker logs -f archaeology-game-test

# Stop test
docker stop archaeology-game-test

# Remove test
docker rm archaeology-game-test

# Cleanup everything
test-local-cleanup.bat

# Rebuild image
docker build -t archaeology-game:test .

# Access container
docker exec -it archaeology-game-test sh

# View container status
docker ps

# Restart container
docker restart archaeology-game-test
```

### File Structure

```
archaeology-game/
├── test-local.bat              # Windows test script
├── test-local.sh               # Linux/Mac test script
├── test-local-cleanup.bat      # Windows cleanup script
├── test-local-cleanup.sh       # Linux/Mac cleanup script
├── Dockerfile                  # Docker image definition
├── .dockerignore              # Files to exclude from build
├── dist/                       # Frontend build (generated by npm run build)
├── server/                     # Backend code
└── .env                        # Environment variables (created by test script)
```

---

## 🎓 Best Practices

1. **Always test locally before deploying to server**
2. **Keep test environment similar to production**
3. **Clean up test containers regularly**
4. **Use separate test data volume**
5. **Don't commit .env file to git**
6. **Rebuild frontend after any frontend changes**
7. **Check logs when something doesn't work**
8. **Test all critical features before deployment**

---

## ✅ Success Criteria

Your local Docker test is successful when:

- ✅ Container starts without errors
- ✅ Health check returns `{"status":"ok"}`
- ✅ Application loads at http://localhost:3001
- ✅ User registration works
- ✅ Email verification code appears in logs
- ✅ User login works
- ✅ Exploration features work
- ✅ Data persists after container restart
- ✅ No errors in browser console
- ✅ No errors in container logs

**Once all above pass, you're ready to deploy to production!** 🚀

---

## 🔗 Related Documentation

- [Docker Deployment Guide](./docker_install.md) - Production deployment
- [Dockerfile](./Dockerfile) - Image configuration
- [docker-compose.yml](./docker-compose.yml) - Container orchestration

---

**Happy Testing!** 🎉

If you encounter any issues not covered in this guide, check the container logs first: `docker logs archaeology-game-test`
