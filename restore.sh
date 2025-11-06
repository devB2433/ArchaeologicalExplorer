#!/bin/bash

# Archaeological Explorer - Database Restore Script
# Restores SQLite database to Docker volume

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
VOLUME_NAME="archaeology-game-data"
CONTAINER_NAME="archaeology-game-app"

echo -e "${GREEN}📥 Archaeological Explorer - Restore Script${NC}"
echo "============================================"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo "Usage: ./restore.sh <backup-file>"
    echo "Example: ./restore.sh ./backups/archaeology-game-backup-20240101_120000.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}Error: Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

# Warning
echo -e "${YELLOW}⚠️  WARNING: This will replace all current data!${NC}"
echo "Backup file: ${BACKUP_FILE}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Stop container if running
echo -e "\n${YELLOW}Stopping application container...${NC}"
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    docker stop ${CONTAINER_NAME}
    echo -e "${GREEN}✓ Container stopped${NC}"
else
    echo "Container not running"
fi

# Restore data
echo -e "\n${YELLOW}Restoring data...${NC}"
docker run --rm \
  -v ${VOLUME_NAME}:/data \
  -v "$(dirname "$(realpath "${BACKUP_FILE}")"):/backup:ro" \
  alpine:latest \
  sh -c "rm -rf /data/* && tar xzf /backup/$(basename "${BACKUP_FILE}") -C /data"

echo -e "${GREEN}✓ Data restored${NC}"

# Restart container
echo -e "\n${YELLOW}Starting application container...${NC}"
docker start ${CONTAINER_NAME}
echo -e "${GREEN}✓ Container started${NC}"

echo -e "\n${GREEN}✅ Restore completed successfully!${NC}"
echo "Application should be available shortly"
