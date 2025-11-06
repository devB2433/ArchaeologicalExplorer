#!/bin/bash

# Local Docker Test Script for Windows (Git Bash / WSL)
# Tests Docker deployment locally before deploying to production server

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🧪 Local Docker Deployment Test${NC}"
echo "=================================="

# Check if Docker is running
echo -e "\n${YELLOW}Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Create test environment file
echo -e "\n${YELLOW}Creating test .env file...${NC}"
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# Test Environment Configuration
EMAIL_SERVICE=hostinger
EMAIL_USER=hello@pokemonrangers.com
EMAIL_PASS="765r6G3KZg#A77"
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
PORT=3001
NODE_ENV=production
JWT_SECRET=test-secret-key-for-local-testing-only
APP_DOMAIN=localhost
APP_URL=http://localhost:3001
DB_PATH=/app/data/database.sqlite
EOF
    echo -e "${GREEN}✓ Test .env created${NC}"
else
    echo -e "${YELLOW}⚠ .env already exists, using existing file${NC}"
fi

# Build Docker image
echo -e "\n${YELLOW}Building Docker image...${NC}"
docker build -t archaeology-game:test .
echo -e "${GREEN}✓ Image built${NC}"

# Stop existing test container if running
echo -e "\n${YELLOW}Cleaning up existing test container...${NC}"
docker stop archaeology-game-test 2>/dev/null || true
docker rm archaeology-game-test 2>/dev/null || true
echo -e "${GREEN}✓ Cleanup done${NC}"

# Create test volume
echo -e "\n${YELLOW}Creating test data volume...${NC}"
docker volume create archaeology-game-test-data 2>/dev/null || true
echo -e "${GREEN}✓ Volume created${NC}"

# Run container
echo -e "\n${YELLOW}Starting test container...${NC}"
docker run -d \
  --name archaeology-game-test \
  -p 3001:3001 \
  -v archaeology-game-test-data:/app/data \
  -v "$(pwd)/.env:/app/.env:ro" \
  archaeology-game:test

echo -e "${GREEN}✓ Container started${NC}"

# Wait for startup
echo -e "\n${YELLOW}Waiting for application to start...${NC}"
sleep 5

# Check container status
if docker ps | grep -q archaeology-game-test; then
    echo -e "${GREEN}✓ Container is running${NC}"
else
    echo -e "${RED}❌ Container failed to start${NC}"
    echo "Logs:"
    docker logs archaeology-game-test
    exit 1
fi

# Test health endpoint
echo -e "\n${YELLOW}Testing health endpoint...${NC}"
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Container logs:"
    docker logs archaeology-game-test
    exit 1
fi

# Test static file serving
echo -e "\n${YELLOW}Testing static file serving...${NC}"
if curl -f http://localhost:3001/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Static files working${NC}"
else
    echo -e "${YELLOW}⚠ Static files may not be served (this is OK if dist/ is empty)${NC}"
fi

# Show success message
echo -e "\n${GREEN}=================================="
echo "✅ Local test successful!"
echo "==================================${NC}"
echo ""
echo "🌐 Application running at: http://localhost:3001"
echo ""
echo "Useful commands:"
echo "  View logs:    docker logs -f archaeology-game-test"
echo "  Stop test:    docker stop archaeology-game-test"
echo "  Remove test:  docker rm archaeology-game-test"
echo "  Shell access: docker exec -it archaeology-game-test sh"
echo ""
echo "To stop and cleanup:"
echo "  ./test-local-cleanup.sh"
