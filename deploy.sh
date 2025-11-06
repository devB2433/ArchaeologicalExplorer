#!/bin/bash

# Archaeological Explorer - Deployment Script
# This script handles building, deploying, and updating the Docker container

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="archaeology-game"
CONTAINER_NAME="archaeology-game-app"
VOLUME_NAME="archaeology-game-data"
PORT="3001"

echo -e "${GREEN}🚀 Archaeological Explorer - Deployment Script${NC}"
echo "=================================================="

# Function to check if container is running
check_container() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        return 0
    else
        return 1
    fi
}

# Function to check if volume exists
check_volume() {
    if docker volume ls --format '{{.Name}}' | grep -q "^${VOLUME_NAME}$"; then
        return 0
    else
        return 1
    fi
}

# Step 1: Create data volume if not exists
echo -e "\n${YELLOW}📦 Step 1: Checking data volume...${NC}"
if check_volume; then
    echo -e "${GREEN}✓ Volume '${VOLUME_NAME}' already exists${NC}"
else
    echo "Creating volume '${VOLUME_NAME}'..."
    docker volume create ${VOLUME_NAME}
    echo -e "${GREEN}✓ Volume created${NC}"
fi

# Step 2: Check .env file
echo -e "\n${YELLOW}⚙️  Step 2: Checking configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ Error: .env file not found${NC}"
    echo "Please create .env file with your configuration"
    echo "You can copy from .env.example if available"
    exit 1
fi
echo -e "${GREEN}✓ Configuration file found${NC}"

# Step 3: Build Docker image
echo -e "\n${YELLOW}🔨 Step 3: Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:latest .
echo -e "${GREEN}✓ Image built successfully${NC}"

# Step 4: Stop and remove old container
echo -e "\n${YELLOW}🛑 Step 4: Stopping old container...${NC}"
if check_container; then
    echo "Stopping container '${CONTAINER_NAME}'..."
    docker stop ${CONTAINER_NAME} || true
    echo "Removing container '${CONTAINER_NAME}'..."
    docker rm ${CONTAINER_NAME} || true
    echo -e "${GREEN}✓ Old container removed${NC}"
else
    echo "No existing container found"
fi

# Step 5: Run new container
echo -e "\n${YELLOW}🚀 Step 5: Starting new container...${NC}"
docker run -d \
  --name ${CONTAINER_NAME} \
  -p 127.0.0.1:${PORT}:${PORT} \
  -v ${VOLUME_NAME}:/app/data \
  -v "$(pwd)/.env:/app/.env:ro" \
  --restart unless-stopped \
  ${IMAGE_NAME}:latest

echo -e "${GREEN}✓ Container started${NC}"

# Step 6: Wait for health check
echo -e "\n${YELLOW}🏥 Step 6: Waiting for health check...${NC}"
echo "Waiting for application to be ready..."
sleep 5

# Check if container is still running
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${GREEN}✓ Container is running${NC}"
    
    # Try to access health endpoint
    if curl -f http://127.0.0.1:${PORT}/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Health check passed${NC}"
    else
        echo -e "${YELLOW}⚠ Health check failed, but container is running${NC}"
        echo "Check logs with: docker logs ${CONTAINER_NAME}"
    fi
else
    echo -e "${RED}✗ Container failed to start${NC}"
    echo "Check logs with: docker logs ${CONTAINER_NAME}"
    exit 1
fi

# Step 7: Clean up old images
echo -e "\n${YELLOW}🧹 Step 7: Cleaning up...${NC}"
echo "Removing dangling images..."
docker image prune -f
echo -e "${GREEN}✓ Cleanup complete${NC}"

# Final summary
echo -e "\n${GREEN}=================================================="
echo "✅ Deployment completed successfully!"
echo "==================================================${NC}"
echo ""
echo "Container name: ${CONTAINER_NAME}"
echo "Internal port: ${PORT}"
echo "Data volume: ${VOLUME_NAME}"
echo ""
echo "Useful commands:"
echo "  View logs:    docker logs -f ${CONTAINER_NAME}"
echo "  Stop:         docker stop ${CONTAINER_NAME}"
echo "  Start:        docker start ${CONTAINER_NAME}"
echo "  Restart:      docker restart ${CONTAINER_NAME}"
echo "  Shell access: docker exec -it ${CONTAINER_NAME} sh"
echo ""
echo "Next step: Configure SafeLine to proxy to 127.0.0.1:${PORT}"
