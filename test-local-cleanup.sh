#!/bin/bash

# Cleanup script for local Docker test

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧹 Cleaning up local Docker test...${NC}"

# Stop and remove container
docker stop archaeology-game-test 2>/dev/null || true
docker rm archaeology-game-test 2>/dev/null || true
echo -e "${GREEN}✓ Container removed${NC}"

# Optional: Remove test volume (uncommment if you want to remove data)
# docker volume rm archaeology-game-test-data 2>/dev/null || true
# echo -e "${GREEN}✓ Volume removed${NC}"

# Optional: Remove test image (uncomment if you want to rebuild from scratch)
# docker rmi archaeology-game:test 2>/dev/null || true
# echo -e "${GREEN}✓ Image removed${NC}"

echo -e "${GREEN}✅ Cleanup complete!${NC}"
